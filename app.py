#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import html
import io
import ipaddress
import json
import os
import platform
import plistlib
import re
import secrets
import shlex
import shutil
import socket
import subprocess
import sys
import tarfile
import time
from datetime import datetime
from html.parser import HTMLParser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.parse import urlsplit
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"
DATA_DIR = ROOT / "data"
SESSIONS_DIR = ROOT / "sessions"
DOWNLOADS_DIR = ROOT / "downloads"
BACKUPS_DIR = ROOT / "backups"
CONVERSION_DIR = DOWNLOADS_DIR / "stock-mx65-conversion"
ROUTER_MANAGER_DIR = ROOT / "router-manager"
DEVICE_PROFILES_DIR = ROOT / "device-profiles"
ROUTER_MANAGER_VERSION = "2026.07.28.1"
SNAPSHOT_PROFILE_URL = "https://downloads.openwrt.org/snapshots/targets/bcm53xx/generic/profiles.json"
SNAPSHOT_BASE_URL = "https://downloads.openwrt.org/snapshots/targets/bcm53xx/generic/"
MX65_UBOOT_BASE_URL = "https://raw.githubusercontent.com/clayface/U-boot-MX64-20190430_MX65/master/"
CLOUDFLARED_LATEST_RELEASE_API = "https://api.github.com/repos/cloudflare/cloudflared/releases/latest"
PROFILE_PATH = DATA_DIR / "openwrt_mx65_profile.json"
GUI_SSH_KEY = DATA_DIR / "mx65_gui_ed25519"
SESSION_TOKEN = secrets.token_urlsafe(32)
DEFAULT_PORT = int(os.environ.get("MX65_GUIDE_PORT", "8787"))
MAX_JSON_BYTES = 2 * 1024 * 1024
MAX_TEXT_FIELD = 12000
MAX_DOWNLOAD_BYTES = 128 * 1024 * 1024
SSH_TIMEOUT_SECONDS = 10
ERASE_PHRASE = "ERASE MX65FLASH"
DEFAULT_ROUTER_HOST = os.environ.get("MX65_DEFAULT_HOST", "192.168.1.1")
DEFAULT_DEVICE_PROFILE_ID = "meraki_mx65"


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href")
        if href:
            self.links.append(href)


def load_cached_profile() -> dict[str, Any]:
    with PROFILE_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def fallback_mx65_device_profile() -> dict[str, Any]:
    return {
        "id": DEFAULT_DEVICE_PROFILE_ID,
        "vendor": "Cisco Meraki",
        "model": "MX65",
        "display_name": "Cisco Meraki MX65",
        "status": "certified",
        "openwrt_target": "bcm53xx/generic",
        "openwrt_profile": "meraki_mx65",
        "default_lan_cidr": "192.168.1.0/24",
        "default_gateway": "192.168.1.1",
        "conversion": {
            "stock_usb": {
                "supported": True,
                "label": "Stock MX65 to OpenWrt USB conversion",
                "bundle_directory": "downloads/stock-mx65-conversion",
            }
        },
        "ports": [
            {"id": "wan1", "label": "Internet 1", "role": "WAN"},
            {"id": "wan2", "label": "Internet 2", "role": "WAN"},
            *[{"id": f"lan{index}", "label": f"LAN {index}", "role": "LAN"} for index in range(3, 13)],
        ],
        "notes": [
            "Certified profile bundled with the app as a fallback when device-profiles are not installed.",
        ],
    }


def load_device_profiles() -> list[dict[str, Any]]:
    profiles: list[dict[str, Any]] = []
    if DEVICE_PROFILES_DIR.is_dir():
        for path in sorted(DEVICE_PROFILES_DIR.glob("*.json")):
            try:
                with path.open("r", encoding="utf-8") as f:
                    profile = json.load(f)
                if isinstance(profile, dict) and profile.get("id"):
                    profile["profile_file"] = str(path.relative_to(ROOT))
                    profiles.append(profile)
            except (OSError, json.JSONDecodeError):
                continue
    if not profiles:
        profiles.append(fallback_mx65_device_profile())
    return sorted(profiles, key=lambda item: (item.get("status") != "certified", str(item.get("display_name") or item.get("id"))))


def load_device_profile(profile_id: str | None = None) -> dict[str, Any]:
    selected = (profile_id or DEFAULT_DEVICE_PROFILE_ID).strip() or DEFAULT_DEVICE_PROFILE_ID
    for profile in load_device_profiles():
        if profile.get("id") == selected:
            return profile
    raise ValueError(f"Device profile is not installed: {selected}")


def profile_supports_stock_usb(profile: dict[str, Any]) -> bool:
    return bool(profile.get("conversion", {}).get("stock_usb", {}).get("supported"))


def parse_version(value: str) -> tuple[int, int, int] | None:
    match = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", value)
    if not match:
        return None
    return tuple(int(part) for part in match.groups())


def fetch_latest_release_profiles(timeout: int = 15) -> tuple[str, str, dict[str, Any]]:
    release_index_url = "https://downloads.openwrt.org/releases/"
    parser = LinkParser()
    with urlopen(release_index_url, timeout=timeout) as response:
        parser.feed(response.read().decode("utf-8", "ignore"))

    versions: list[tuple[tuple[int, int, int], str]] = []
    for link in parser.links:
        name = link.strip("/")
        parsed = parse_version(name)
        if parsed is not None:
            versions.append((parsed, name))
    if not versions:
        raise RuntimeError("No stable OpenWrt releases found in release index.")

    latest = sorted(versions)[-1][1]
    profile_url = f"https://downloads.openwrt.org/releases/{latest}/targets/bcm53xx/generic/profiles.json"
    with urlopen(profile_url, timeout=timeout) as response:
        data = json.loads(response.read().decode("utf-8"))
    return latest, profile_url, data


def fetch_latest_mx65_profile(timeout: int = 15) -> dict[str, Any]:
    release_index_url = "https://downloads.openwrt.org/releases/"
    latest, profile_url, data = fetch_latest_release_profiles(timeout=timeout)

    profile = data.get("profiles", {}).get("meraki_mx65")
    if not profile:
        raise RuntimeError(f"OpenWrt {latest} has no meraki_mx65 profile in bcm53xx/generic.")

    return {
        "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "latest_release_checked": latest,
        "release_index_url": release_index_url,
        "profile_url": profile_url,
        "download_base_url": f"https://downloads.openwrt.org/releases/{latest}/targets/bcm53xx/generic/",
        "source_makefile_url": f"https://github.com/openwrt/openwrt/blob/v{latest}/target/linux/bcm53xx/image/Makefile",
        "target": data.get("target", "bcm53xx/generic"),
        "profile_id": "meraki_mx65",
        "version_number": data.get("version_number", latest),
        "version_code": data.get("version_code", ""),
        "source_date_epoch": data.get("source_date_epoch"),
        "profile": profile,
        "notes": [
            "Live metadata was fetched from the official OpenWrt downloads host.",
            "The app still refuses to execute destructive flashing commands.",
        ],
    }


def fetch_latest_meraki_mx_profiles(timeout: int = 15) -> dict[str, Any]:
    latest, profile_url, data = fetch_latest_release_profiles(timeout=timeout)
    official_profiles = data.get("profiles", {})
    profiles: list[dict[str, Any]] = []
    for profile in load_device_profiles():
        openwrt_profile = str(profile.get("openwrt_profile") or profile.get("id"))
        official = official_profiles.get(openwrt_profile)
        image = None
        if isinstance(official, dict):
            for candidate in official.get("images", []):
                if candidate.get("type") == "sysupgrade":
                    image = candidate
                    break
        profiles.append(
            {
                "id": profile.get("id"),
                "display_name": profile.get("display_name"),
                "openwrt_profile": openwrt_profile,
                "status": profile.get("status"),
                "official_sysupgrade": bool(image),
                "official_sysupgrade_name": image.get("name") if image else "",
                "official_sysupgrade_sha256": image.get("sha256") if image else "",
                "stock_usb_supported": profile_supports_stock_usb(profile),
            }
        )
    return {
        "checked_at": datetime.now().isoformat(timespec="seconds"),
        "latest_release_checked": latest,
        "profile_url": profile_url,
        "target": data.get("target", "bcm53xx/generic"),
        "profiles": profiles,
    }


def sha256_file(path: Path) -> tuple[str, int]:
    digest = hashlib.sha256()
    total = 0
    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            digest.update(chunk)
    return digest.hexdigest(), total


def sha512_file(path: Path) -> tuple[str, int]:
    digest = hashlib.sha512()
    total = 0
    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            digest.update(chunk)
    return digest.hexdigest(), total


def fetch_json(url: str, timeout: int = 20) -> dict[str, Any]:
    with urlopen(url, timeout=timeout) as response:
        data = json.loads(response.read().decode("utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"Expected JSON object from {url}")
    return data


def fetch_text(url: str, timeout: int = 20) -> str:
    with urlopen(url, timeout=timeout) as response:
        return response.read().decode("utf-8", "replace")


def download_file(url: str, out: Path, max_bytes: int = MAX_DOWNLOAD_BYTES) -> int:
    out.parent.mkdir(parents=True, exist_ok=True)
    temp = out.with_suffix(out.suffix + ".download")
    size = 0
    with urlopen(url, timeout=30) as response, temp.open("wb") as f:
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                temp.unlink(missing_ok=True)
                raise ValueError(f"Download exceeded expected size for {url}")
            f.write(chunk)
    temp.replace(out)
    return size


def truncate_text(value: Any, limit: int = MAX_TEXT_FIELD) -> str:
    text = "" if value is None else str(value)
    if len(text) <= limit:
        return text
    return text[:limit] + "\n[truncated by MX65 guide export]"


def extract_profile_image(profile_data: dict[str, Any]) -> dict[str, Any] | None:
    for image in profile_data.get("profile", {}).get("images", []):
        if image.get("type") == "sysupgrade":
            return image
    return None


def official_sysupgrade_url(profile_data: dict[str, Any]) -> str:
    image = extract_profile_image(profile_data)
    if not image:
        raise ValueError("No sysupgrade image exists in the loaded MX65 profile.")
    return str(profile_data["download_base_url"]) + str(image["name"])


def download_official_sysupgrade(profile_data: dict[str, Any]) -> dict[str, Any]:
    image = extract_profile_image(profile_data)
    if not image:
        raise ValueError("No sysupgrade image exists in the loaded MX65 profile.")

    DOWNLOADS_DIR.mkdir(exist_ok=True)
    out = DOWNLOADS_DIR / str(image["name"])
    temp = out.with_suffix(out.suffix + ".download")
    url = official_sysupgrade_url(profile_data)
    expected = str(image.get("sha256", "")).lower()

    digest = hashlib.sha256()
    size = 0
    with urlopen(url, timeout=30) as response, temp.open("wb") as f:
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_DOWNLOAD_BYTES:
                raise ValueError("Download exceeded the maximum expected OpenWrt image size.")
            digest.update(chunk)
            f.write(chunk)

    actual = digest.hexdigest()
    if expected and actual != expected:
        temp.unlink(missing_ok=True)
        raise ValueError(f"Downloaded image hash mismatch: expected {expected}, got {actual}")

    temp.replace(out)
    return {
        "path": str(out),
        "name": out.name,
        "size": size,
        "sha256": actual,
        "matches_official_sysupgrade": actual == expected,
        "url": url,
    }


def official_download_status(profile_data: dict[str, Any]) -> dict[str, Any] | None:
    image = extract_profile_image(profile_data)
    if not image:
        return None
    target = DOWNLOADS_DIR / str(image["name"])
    if not target.is_file():
        return None
    digest, size = sha256_file(target)
    expected = str(image.get("sha256", "")).lower()
    return {
        "path": str(target),
        "name": target.name,
        "size": size,
        "sha256": digest,
        "matches_official_sysupgrade": digest == expected,
        "url": official_sysupgrade_url(profile_data),
    }


def snapshot_mx65_profile() -> dict[str, Any]:
    data = fetch_json(SNAPSHOT_PROFILE_URL)
    profile = data.get("profiles", {}).get("meraki_mx65")
    if not isinstance(profile, dict):
        raise ValueError("Current OpenWrt snapshot metadata has no meraki_mx65 profile.")
    return {
        "target": data.get("target", "bcm53xx/generic"),
        "version_number": data.get("version_number", "SNAPSHOT"),
        "version_code": data.get("version_code", ""),
        "profile": profile,
    }


def image_by_type(profile: dict[str, Any], image_type: str) -> dict[str, Any]:
    for image in profile.get("profile", {}).get("images", []):
        if image.get("type") == image_type:
            return image
    raise ValueError(f"Snapshot MX65 profile has no {image_type} image.")


def read_conversion_manifest() -> dict[str, Any] | None:
    path = CONVERSION_DIR / "manifest.json"
    if not path.is_file():
        return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_conversion_readme(files: list[dict[str, Any]], snapshot: dict[str, Any]) -> Path:
    initramfs = next((item for item in files if item.get("role") == "initramfs"), {})
    sysupgrade = next((item for item in files if item.get("role") == "sysupgrade"), {})
    readme = CONVERSION_DIR / "READ_ME_FIRST_MX65.txt"
    readme.write_text(
        "\n".join(
            [
                "MX65 STOCK CONVERSION -> OPENWRT USB",
                "",
                "USB format required before copying files:",
                "- DOS/MBR partition scheme",
                "- one primary FAT/FAT32 partition",
                "",
                "Defaults used by this workflow:",
                "- setup machine: macOS",
                "- USB label: MX65FLASH",
                "- stock recovery router IP: 192.168.1.1",
                "- direct laptop IP: 192.168.1.2/24",
                "- default dashboard URL after OpenWrt install: http://192.168.1.1/mx65/",
                "",
                "Files on this USB:",
                "- uboot_mx65: use when /proc/mtd shows mtd0 size 00100000 or larger",
                "- uboot_mx65_small: use ONLY when /proc/mtd shows mtd0 size 00080000",
                f"- {initramfs.get('name', 'openwrt-bcm53xx-generic-meraki_mx65-initramfs.bin')}: initramfs boot image",
                f"- {sysupgrade.get('name', 'openwrt-bcm53xx-generic-meraki_mx65-squashfs.sysupgrade.bin')}: permanent install image",
                "",
                "Stock MX65 conversion sequence:",
                "1. Work offline. Disconnect the MX65 from your home network, modem, switches, and Internet.",
                "2. Connect one laptop directly by Ethernet to the first LAN port. On MX65 this means the first LAN port after the WAN ports.",
                "3. Turn off laptop Wi-Fi or make sure Ethernet is the active route.",
                "4. Set laptop Ethernet manually to 192.168.1.2/24. Gateway can be blank or 192.168.1.1.",
                "5. Hold reset while plugging in power, then release after the diagnostic window begins.",
                "   Note: on one tested MX65-HW, the front status LED did NOT show a clear diagnostic transition.",
                "   Do not rely only on LED color; use Ethernet link and ping reachability.",
                "6. Test connectivity: ping 192.168.1.1",
                "7. Open the diagnostic shell at 192.168.1.1 using the stock recovery method available to you.",
                "8. Run: cat /proc/mtd",
                "",
                "Choose the U-Boot file:",
                "- mtd0: 00100000 ... \"boot\"  -> use uboot_mx65",
                "- mtd0: 00080000 ... \"boot\"  -> use uboot_mx65_small",
                "",
                "Bootloader write command after USB automounts as /tmp/media/sda1:",
                "cd /tmp/media/sda1",
                "dd if=uboot_mx65 of=/dev/mtdblock0",
                "",
                "If your mtd0 size was 00080000, replace uboot_mx65 with uboot_mx65_small.",
                "Do not run either dd command until you have confirmed the mtd0 size and filename.",
                "",
                "After U-Boot write succeeds:",
                "1. Power off.",
                "2. Leave this USB inserted.",
                "3. Power on and let it boot the OpenWrt initramfs from USB.",
                "4. SSH to 192.168.1.1.",
                "5. From your laptop, copy sysupgrade to /tmp:",
                f"   scp {sysupgrade.get('name', 'openwrt-bcm53xx-generic-meraki_mx65-squashfs.sysupgrade.bin')} root@192.168.1.1:/tmp/",
                "6. On the router:",
                f"   sysupgrade /tmp/{sysupgrade.get('name', 'openwrt-bcm53xx-generic-meraki_mx65-squashfs.sysupgrade.bin')}",
                "7. After permanent OpenWrt boot, remove the USB and install the dashboard from this repository:",
                "   ./scripts/install-and-activate.sh",
                "",
                "Snapshot metadata used:",
                f"- target: {snapshot.get('target')}",
                f"- version: {snapshot.get('version_number')} {snapshot.get('version_code')}",
                f"- source: {SNAPSHOT_PROFILE_URL}",
                "",
            ]
        ),
        encoding="utf-8",
    )
    return readme


def conversion_bundle_status() -> dict[str, Any] | None:
    manifest = read_conversion_manifest()
    if not manifest:
        return None
    checks: list[dict[str, Any]] = []
    all_ok = True
    for item in manifest.get("files", []):
        path = Path(str(item.get("path", "")))
        exists = path.is_file()
        ok = exists
        if exists:
            if item.get("hash") == "sha512":
                digest, size = sha512_file(path)
            else:
                digest, size = sha256_file(path)
            ok = digest == item.get("expected") and size == item.get("size")
        all_ok = all_ok and ok
        checks.append({"name": item.get("name"), "path": str(path), "ok": ok, "exists": exists})
    manifest["checks"] = checks
    manifest["all_ok"] = all_ok
    return manifest


def download_stock_conversion_bundle(profile_id: str | None = None) -> dict[str, Any]:
    device_profile = load_device_profile(profile_id)
    if not profile_supports_stock_usb(device_profile):
        raise ValueError(
            f"{device_profile.get('display_name') or device_profile.get('id')} is recognized, "
            "but stock-conversion USB creation is not certified for this profile yet."
        )
    if device_profile.get("openwrt_profile") != "meraki_mx65":
        raise ValueError("The bundled stock-conversion workflow is currently certified only for meraki_mx65.")

    CONVERSION_DIR.mkdir(parents=True, exist_ok=True)
    snapshot = snapshot_mx65_profile()
    initramfs = image_by_type(snapshot, "kernel")
    sysupgrade = image_by_type(snapshot, "sysupgrade")

    files: list[dict[str, Any]] = []
    for role, image in [("initramfs", initramfs), ("sysupgrade", sysupgrade)]:
        name = str(image["name"])
        url = SNAPSHOT_BASE_URL + name
        path = CONVERSION_DIR / name
        download_file(url, path)
        digest, size = sha256_file(path)
        expected = str(image["sha256"]).lower()
        if digest != expected:
            path.unlink(missing_ok=True)
            raise ValueError(f"{name} SHA256 mismatch: expected {expected}, got {digest}")
        files.append(
            {
                "role": role,
                "name": name,
                "path": str(path),
                "url": url,
                "hash": "sha256",
                "expected": expected,
                "actual": digest,
                "size": size,
            }
        )

    for role, name in [("uboot", "uboot_mx65"), ("uboot-small", "uboot_mx65_small")]:
        expected_text = fetch_text(MX65_UBOOT_BASE_URL + name + ".sha512")
        expected_match = re.search(r"([0-9a-fA-F]{128})", expected_text)
        if not expected_match:
            raise ValueError(f"Could not parse SHA512 for {name}.")
        expected = expected_match.group(1).lower()
        path = CONVERSION_DIR / name
        download_file(MX65_UBOOT_BASE_URL + name, path, max_bytes=8 * 1024 * 1024)
        digest, size = sha512_file(path)
        if digest != expected:
            path.unlink(missing_ok=True)
            raise ValueError(f"{name} SHA512 mismatch: expected {expected}, got {digest}")
        files.append(
            {
                "role": role,
                "name": name,
                "path": str(path),
                "url": MX65_UBOOT_BASE_URL + name,
                "hash": "sha512",
                "expected": expected,
                "actual": digest,
                "size": size,
            }
        )

    readme = write_conversion_readme(files, snapshot)
    readme_digest, readme_size = sha256_file(readme)
    files.append(
        {
            "role": "instructions",
            "name": readme.name,
            "path": str(readme),
            "url": "",
            "hash": "sha256",
            "expected": readme_digest,
            "actual": readme_digest,
            "size": readme_size,
        }
    )
    manifest = {
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "kind": "stock-mx65-conversion",
        "device_profile_id": device_profile.get("id"),
        "device_display_name": device_profile.get("display_name"),
        "source_notes": [
            "OpenWrt snapshots are used because stable 25.12.5 does not publish the MX65 initramfs image.",
            "U-Boot files are from clayface/U-boot-MX64-20190430_MX65 and verified by SHA512 sidecar files.",
        ],
        "snapshot_profile_url": SNAPSHOT_PROFILE_URL,
        "snapshot_target": snapshot.get("target"),
        "snapshot_version": snapshot.get("version_number"),
        "snapshot_code": snapshot.get("version_code"),
        "files": files,
    }
    (CONVERSION_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return conversion_bundle_status() or manifest


def list_usb_candidates() -> list[dict[str, Any]]:
    volumes = Path("/Volumes")
    if not volumes.is_dir():
        return []
    candidates: list[dict[str, Any]] = []
    for child in sorted(volumes.iterdir(), key=lambda item: item.name.lower()):
        if not child.is_dir() or child.name == "Macintosh HD":
            continue
        if child.name.upper() == "MX65FLASH":
            candidates.append({"name": child.name, "path": str(child)})
            continue
        if platform.system() != "Darwin":
            continue
        try:
            result = subprocess.run(
                ["diskutil", "info", "-plist", str(child)],
                check=True,
                capture_output=True,
                timeout=5,
            )
            plist = plistlib.loads(result.stdout)
            if plist.get("MediaRemovable") or plist.get("Removable"):
                candidates.append({"name": child.name, "path": str(child)})
        except (subprocess.SubprocessError, plistlib.InvalidFileException, OSError):
            continue
    return candidates


def volume_info(raw_path: str) -> dict[str, Any]:
    if not raw_path.strip():
        raise ValueError("USB mount path is required.")
    mount = Path(raw_path).expanduser()
    if not mount.exists():
        raise ValueError(f"Path not found: {mount}")

    info: dict[str, Any] = {
        "path": str(mount),
        "exists": True,
        "is_dir": mount.is_dir(),
        "platform": platform.system(),
    }
    try:
        usage = shutil.disk_usage(mount)
        info["free_bytes"] = usage.free
        info["total_bytes"] = usage.total
    except OSError:
        pass

    if platform.system() == "Darwin":
        try:
            result = subprocess.run(
                ["diskutil", "info", "-plist", str(mount)],
                check=True,
                capture_output=True,
                timeout=10,
            )
            plist = plistlib.loads(result.stdout)
            keep = [
                "DeviceIdentifier",
                "DeviceNode",
                "FilesystemName",
                "FilesystemType",
                "FilesystemUserVisibleName",
                "MediaRemovable",
                "MountPoint",
                "ParentWholeDisk",
                "VolumeName",
                "Writable",
            ]
            info["diskutil"] = {key: plist.get(key) for key in keep if key in plist}
            device = plist.get("DeviceIdentifier")
            whole = plist.get("ParentWholeDisk") or device
            if whole:
                info["format_command_preview"] = f"diskutil eraseDisk FAT32 MX65FLASH MBRFormat /dev/{whole}"
        except (subprocess.SubprocessError, plistlib.InvalidFileException, OSError) as exc:
            info["diskutil_error"] = str(exc)
    return info


def diskutil_info(device: str) -> dict[str, Any]:
    result = subprocess.run(
        ["diskutil", "info", "-plist", device],
        check=True,
        capture_output=True,
        timeout=10,
    )
    data = plistlib.loads(result.stdout)
    if not isinstance(data, dict):
        raise ValueError(f"Unexpected diskutil info output for {device}.")
    return data


def list_format_disks() -> list[dict[str, Any]]:
    if platform.system() != "Darwin":
        return []
    result = subprocess.run(
        ["diskutil", "list", "-plist", "external", "physical"],
        check=True,
        capture_output=True,
        timeout=10,
    )
    data = plistlib.loads(result.stdout)
    disks: list[dict[str, Any]] = []
    for disk in data.get("AllDisksAndPartitions", []):
        disk_id = str(disk.get("DeviceIdentifier", ""))
        if not re.fullmatch(r"disk\d+", disk_id):
            continue
        info = diskutil_info(f"/dev/{disk_id}")
        removable = bool(info.get("Removable") or info.get("RemovableMedia") or info.get("EjectableOnly"))
        if info.get("Internal") or info.get("VirtualOrPhysical") != "Physical" or not removable:
            continue
        partitions = []
        for partition in disk.get("Partitions", []):
            partitions.append(
                {
                    "device": partition.get("DeviceIdentifier"),
                    "content": partition.get("Content"),
                    "volume_name": partition.get("VolumeName"),
                    "mount_point": partition.get("MountPoint"),
                    "size": partition.get("Size"),
                }
            )
        disks.append(
            {
                "disk_id": disk_id,
                "device_node": f"/dev/{disk_id}",
                "content": disk.get("Content"),
                "size": disk.get("Size"),
                "bus_protocol": info.get("BusProtocol"),
                "media_name": info.get("MediaName") or info.get("IORegistryEntryName"),
                "removable": removable,
                "writable": info.get("Writable") and info.get("WritableMedia"),
                "partitions": partitions,
            }
        )
    return disks


def format_usb_disk(disk_id: str, phrase: str) -> dict[str, Any]:
    disk_id = disk_id.strip()
    if platform.system() != "Darwin":
        raise ValueError("USB formatting is currently implemented for macOS diskutil only.")
    if phrase != ERASE_PHRASE:
        raise ValueError(f'Type exactly "{ERASE_PHRASE}" before erasing a USB disk.')
    if not re.fullmatch(r"disk\d+", disk_id):
        raise ValueError("Select an external whole disk identifier, for example disk4.")

    allowed = {disk["disk_id"] for disk in list_format_disks()}
    if disk_id not in allowed:
        raise ValueError(f"{disk_id} is not listed as an external physical disk by diskutil.")

    command = ["diskutil", "eraseDisk", "FAT32", "MX65FLASH", "MBRFormat", f"/dev/{disk_id}"]
    result = subprocess.run(command, capture_output=True, timeout=180)
    stdout = decode_output(result.stdout)[:MAX_TEXT_FIELD]
    stderr = decode_output(result.stderr)[:4000]
    if result.returncode != 0:
        raise ValueError((stderr or stdout or f"diskutil exited with {result.returncode}").strip())
    return {
        "disk_id": disk_id,
        "command": " ".join(command),
        "returncode": result.returncode,
        "stdout": stdout,
        "stderr": stderr,
        "mount_path": "/Volumes/MX65FLASH",
    }


def stage_usb_files(usb_path: str, file_paths: list[str], overwrite: bool = False) -> dict[str, Any]:
    root = Path(usb_path).expanduser()
    if not root.is_dir():
        raise ValueError(f"USB directory not found: {root}")
    if not file_paths:
        raise ValueError("No files were provided for USB staging.")

    staged: list[dict[str, Any]] = []
    for raw in file_paths:
        source = Path(raw).expanduser()
        if not source.is_file():
            raise ValueError(f"Stage source file not found: {source}")
        destination = root / source.name
        if destination.exists() and not overwrite:
            raise ValueError(f"Refusing to overwrite existing USB file: {destination}")
        shutil.copy2(source, destination)
        src_hash, src_size = sha256_file(source)
        dst_hash, dst_size = sha256_file(destination)
        staged.append(
            {
                "source": str(source),
                "destination": str(destination),
                "name": destination.name,
                "size": dst_size,
                "sha256": dst_hash,
                "verified": src_hash == dst_hash and src_size == dst_size,
            }
        )
    return {"path": str(root), "staged": staged, "all_verified": all(item["verified"] for item in staged)}


def validate_ssh_target(host: str, user: str) -> tuple[str, str]:
    host = host.strip()
    user = user.strip() or "root"
    if not re.fullmatch(r"[A-Za-z0-9_.:-]{1,255}", host):
        raise ValueError("Router host must be a plain hostname or IP address.")
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,64}", user):
        raise ValueError("Router user contains unsupported characters.")
    return host, user


def ensure_gui_ssh_key() -> dict[str, Any]:
    DATA_DIR.mkdir(exist_ok=True)
    pub = GUI_SSH_KEY.with_suffix(GUI_SSH_KEY.suffix + ".pub")
    if not GUI_SSH_KEY.exists() or not pub.exists():
        ssh_keygen = shutil.which("ssh-keygen")
        if not ssh_keygen:
            raise ValueError("ssh-keygen was not found on this Mac.")
        result = subprocess.run(
            [
                ssh_keygen,
                "-t",
                "ed25519",
                "-N",
                "",
                "-C",
                "mx65-gui",
                "-f",
                str(GUI_SSH_KEY),
            ],
            capture_output=True,
            timeout=15,
        )
        if result.returncode != 0:
            raise ValueError(decode_output(result.stderr) or "ssh-keygen failed.")
        try:
            GUI_SSH_KEY.chmod(0o600)
        except OSError:
            pass
    public_key = pub.read_text(encoding="utf-8").strip()
    install_command = (
        "mkdir -p /etc/dropbear && "
        f"grep -qxF {shlex.quote(public_key)} /etc/dropbear/authorized_keys 2>/dev/null || "
        f"echo {shlex.quote(public_key)} >> /etc/dropbear/authorized_keys; "
        "chmod 600 /etc/dropbear/authorized_keys"
    )
    return {
        "private_key": str(GUI_SSH_KEY),
        "public_key": public_key,
        "install_command": install_command,
    }


def ssh_command(host: str, user: str, command: str, timeout: int = SSH_TIMEOUT_SECONDS) -> subprocess.CompletedProcess[bytes]:
    ssh = shutil.which("ssh")
    if not ssh:
        raise ValueError("ssh was not found on this Mac.")
    host, user = validate_ssh_target(host, user)
    args = [
        ssh,
        "-o",
        "BatchMode=yes",
        "-o",
        f"ConnectTimeout={timeout}",
        "-o",
        "StrictHostKeyChecking=accept-new",
    ]
    if GUI_SSH_KEY.exists():
        args.extend(["-i", str(GUI_SSH_KEY)])
    args.extend([f"{user}@{host}", command])
    return subprocess.run(args, capture_output=True, timeout=timeout + 5)


def decode_output(raw: bytes) -> str:
    return raw.decode("utf-8", "replace")


def ssh_checked(host: str, user: str, command: str, timeout: int = SSH_TIMEOUT_SECONDS) -> dict[str, Any]:
    result = ssh_command(host, user, command, timeout=timeout)
    stdout = decode_output(result.stdout)[:MAX_TEXT_FIELD]
    stderr = decode_output(result.stderr)[:4000]
    if result.returncode != 0:
        raise ValueError((stderr or stdout or f"ssh command exited with {result.returncode}").strip())
    return {"returncode": result.returncode, "stdout": stdout, "stderr": stderr}


def ssh_with_input(host: str, user: str, command: str, data: bytes, timeout: int = SSH_TIMEOUT_SECONDS) -> dict[str, Any]:
    ssh = shutil.which("ssh")
    if not ssh:
        raise ValueError("ssh was not found on this Mac.")
    host, user = validate_ssh_target(host, user)
    args = [
        ssh,
        "-o",
        "BatchMode=yes",
        "-o",
        f"ConnectTimeout={timeout}",
        "-o",
        "StrictHostKeyChecking=accept-new",
    ]
    if GUI_SSH_KEY.exists():
        args.extend(["-i", str(GUI_SSH_KEY)])
    args.extend([f"{user}@{host}", command])
    result = subprocess.run(args, input=data, capture_output=True, timeout=timeout + 5)
    stdout = decode_output(result.stdout)[:MAX_TEXT_FIELD]
    stderr = decode_output(result.stderr)[:4000]
    if result.returncode != 0:
        raise ValueError((stderr or stdout or f"ssh command exited with {result.returncode}").strip())
    return {"returncode": result.returncode, "stdout": stdout, "stderr": stderr}


def ssh_run_script(host: str, user: str, script: str, timeout: int = SSH_TIMEOUT_SECONDS) -> dict[str, Any]:
    return ssh_with_input(host, user, "/bin/sh -s", script.encode("utf-8"), timeout=timeout)


def build_router_manager_package() -> dict[str, Any]:
    if not ROUTER_MANAGER_DIR.is_dir():
        raise ValueError(f"Router manager bundle not found: {ROUTER_MANAGER_DIR}")

    entries: list[dict[str, Any]] = []
    file_payloads: list[tuple[str, bytes, int]] = []
    for path in sorted(ROUTER_MANAGER_DIR.rglob("*")):
        if not path.is_file():
            continue
        arcname = str(path.relative_to(ROUTER_MANAGER_DIR))
        data = path.read_bytes()
        mode = 0o755 if arcname.startswith("www/cgi-bin/") else 0o644
        entries.append(
            {
                "path": arcname,
                "sha256": hashlib.sha256(data).hexdigest(),
                "size": len(data),
                "mode": oct(mode),
            }
        )
        file_payloads.append((arcname, data, mode))

    manifest = {
        "name": "myracke-router-manager",
        "brand": "My-Rack-E",
        "platform": "powered by OpenWrt",
        "version": ROUTER_MANAGER_VERSION,
        "built_at": datetime.now().isoformat(timespec="seconds"),
        "schema": 1,
        "trust": {
            "transport": "root SSH from the Mac manager",
            "checks": [
                "archive SHA-256 verified on the router before extraction",
                "managed file SHA-256 manifest verified in staging before install",
                "existing router manager backed up before replacement",
            ],
        },
        "files": entries,
    }
    manifest_data = json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8")
    file_payloads.append(("etc/mx65-manager/manifest.json", manifest_data, 0o644))
    sha_lines = [
        f"{entry['sha256']}  {entry['path']}"
        for entry in entries
    ]
    sha_lines.append(f"{hashlib.sha256(manifest_data).hexdigest()}  etc/mx65-manager/manifest.json")
    sha_data = ("\n".join(sha_lines) + "\n").encode("utf-8")
    file_payloads.append(("etc/mx65-manager/manifest.sha256", sha_data, 0o644))

    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        for arcname, data, mode in file_payloads:
            info = tarfile.TarInfo(arcname)
            info.size = len(data)
            info.mtime = int(time.time())
            info.mode = mode
            tar.addfile(info, io.BytesIO(data))
    archive = buffer.getvalue()
    manifest["archive_sha256"] = hashlib.sha256(archive).hexdigest()
    manifest["archive_size"] = len(archive)
    return {"archive": archive, "manifest": manifest}


def build_router_manager_archive() -> bytes:
    return build_router_manager_package()["archive"]


def split_sections(raw: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current = ""
    for line in raw.splitlines():
        marker = re.match(r"^__MX65_SECTION__\s+([A-Za-z0-9_-]+)$", line.strip())
        if marker:
            current = marker.group(1)
            sections[current] = []
            continue
        if current:
            sections[current].append(line)
    return {name: "\n".join(lines).strip() for name, lines in sections.items()}


def parse_release(text: str) -> dict[str, str]:
    data: dict[str, str] = {}
    for line in text.splitlines():
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip("'\"")
    return data


def parse_json_object(text: str) -> dict[str, Any] | None:
    text = text.strip()
    if not text:
        return None
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, dict) else None


def parse_uci(text: str) -> dict[str, Any]:
    entries: list[dict[str, str]] = []
    sections: dict[str, dict[str, Any]] = {}
    for line in text.splitlines():
        if "=" not in line:
            continue
        path, raw_value = line.split("=", 1)
        value = raw_value.strip().strip("'\"")
        parts = path.split(".")
        if len(parts) < 2:
            continue
        package = parts[0]
        section = parts[1]
        option = ".".join(parts[2:]) if len(parts) > 2 else "__type__"
        key = f"{package}.{section}"
        record = sections.setdefault(key, {"package": package, "section": section, "options": {}})
        if option == "__type__":
            record["type"] = value
        else:
            record["options"][option] = value
            entries.append({"path": path, "value": value})
    return {"entries": entries, "sections": list(sections.values())}


def parse_ip_brief(text: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line in text.splitlines():
        parts = line.split()
        if len(parts) < 3:
            continue
        rows.append(
            {
                "name": parts[0],
                "operstate": parts[1],
                "addresses": parts[2:],
                "up": parts[1].upper() in {"UP", "UNKNOWN"},
                "carrier": parts[1].upper() not in {"DOWN", "LOWERLAYERDOWN"},
            }
        )
    return rows


def parse_services(text: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for line in text.splitlines():
        if not line.strip():
            continue
        parts = line.split(maxsplit=2)
        rows.append(
            {
                "name": parts[0],
                "enabled": parts[1] if len(parts) > 1 else "unknown",
                "status": parts[2] if len(parts) > 2 else "",
            }
        )
    return rows


def parse_dhcp_leases(text: str) -> list[dict[str, str]]:
    leases: list[dict[str, str]] = []
    for line in text.splitlines():
        parts = line.split()
        if len(parts) < 4:
            continue
        leases.append(
            {
                "expires": parts[0],
                "mac": parts[1],
                "ip": parts[2],
                "hostname": parts[3],
                "client_id": parts[4] if len(parts) > 4 else "",
            }
        )
    return leases


def openwrt_snapshot(host: str, user: str) -> dict[str, Any]:
    commands = {
        "release": "cat /etc/openwrt_release 2>/dev/null || true",
        "board": "ubus call system board 2>/dev/null || true",
        "uptime": "uptime 2>/dev/null || true",
        "loadavg": "cat /proc/loadavg 2>/dev/null || true",
        "memory": "free -h 2>/dev/null || cat /proc/meminfo 2>/dev/null || true",
        "storage": "df -h 2>/dev/null || true",
        "ip_brief": "ip -brief addr 2>/dev/null || ip addr show 2>/dev/null || true",
        "routes": "ip route show 2>/dev/null || true",
        "wan": "ifstatus wan 2>/dev/null || true",
        "lan": "ifstatus lan 2>/dev/null || true",
        "network_dump": "ubus call network.interface dump 2>/dev/null || true",
        "uci_network": "uci show network 2>/dev/null || true",
        "uci_dhcp": "uci show dhcp 2>/dev/null || true",
        "uci_firewall": "uci show firewall 2>/dev/null || true",
        "leases": "cat /tmp/dhcp.leases 2>/dev/null || true",
        "services": "for s in dnsmasq odhcpd firewall network dropbear; do printf \"%s \" \"$s\"; /etc/init.d/$s enabled >/dev/null 2>&1 && printf enabled || printf disabled; printf \" \"; /etc/init.d/$s status 2>/dev/null || true; done",
        "fw_check": "fw4 check 2>&1 || true",
        "logs": "logread -l 120 2>/dev/null || dmesg | tail -120 2>/dev/null || true",
    }
    script = " ; ".join([f"printf '\\n__MX65_SECTION__ {name}\\n'; {cmd}" for name, cmd in commands.items()])
    result = ssh_checked(host, user, script, timeout=25)
    sections = split_sections(result["stdout"])
    release = parse_release(sections.get("release", ""))
    uci_network = parse_uci(sections.get("uci_network", ""))
    uci_dhcp = parse_uci(sections.get("uci_dhcp", ""))
    uci_firewall = parse_uci(sections.get("uci_firewall", ""))
    return {
        "host": host,
        "user": user,
        "checked_at": datetime.now().isoformat(timespec="seconds"),
        "release": release,
        "board": parse_json_object(sections.get("board", "")),
        "wan": parse_json_object(sections.get("wan", "")),
        "lan": parse_json_object(sections.get("lan", "")),
        "network_dump": parse_json_object(sections.get("network_dump", "")),
        "interfaces": parse_ip_brief(sections.get("ip_brief", "")),
        "services": parse_services(sections.get("services", "")),
        "leases": parse_dhcp_leases(sections.get("leases", "")),
        "uci": {"network": uci_network, "dhcp": uci_dhcp, "firewall": uci_firewall},
        "raw": sections,
    }


def validate_uci_path(path: str) -> str:
    path = path.strip()
    if not re.fullmatch(r"(network|dhcp|firewall)\.[A-Za-z0-9_@.\[\]-]+", path):
        raise ValueError("UCI path must be in network, dhcp, or firewall.")
    return path


def validate_uci_package(package: str) -> str:
    package = package.strip()
    if package not in {"network", "dhcp", "firewall"}:
        raise ValueError("UCI package must be network, dhcp, or firewall.")
    return package


def validate_router_value(value: str, limit: int = 256) -> str:
    value = value.strip()
    if len(value) > limit:
        raise ValueError("Value is too long.")
    if "\x00" in value or "\n" in value or "\r" in value:
        raise ValueError("Value contains unsupported characters.")
    return value


def openwrt_uci_set(host: str, user: str, path: str, value: str, commit: bool = False) -> dict[str, Any]:
    path = validate_uci_path(path)
    value = validate_router_value(value)
    package = path.split(".", 1)[0]
    commands = [f"uci set {path}={shlex.quote(value)}"]
    if commit:
        commands.append(f"uci commit {package}")
    result = ssh_checked(host, user, " && ".join(commands), timeout=12)
    return {"path": path, "value": value, "committed": commit, **result}


def openwrt_uci_changes(host: str, user: str) -> dict[str, Any]:
    commands = {
        "all": "uci changes 2>/dev/null || true",
        "network": "uci changes network 2>/dev/null || true",
        "dhcp": "uci changes dhcp 2>/dev/null || true",
        "firewall": "uci changes firewall 2>/dev/null || true",
    }
    script = " ; ".join([f"printf '\\n__MX65_SECTION__ {name}\\n'; {cmd}" for name, cmd in commands.items()])
    result = ssh_checked(host, user, script, timeout=15)
    sections = split_sections(result["stdout"])
    packages = {
        name: [line for line in sections.get(name, "").splitlines() if line.strip()]
        for name in ["network", "dhcp", "firewall"]
    }
    return {
        "checked_at": datetime.now().isoformat(timespec="seconds"),
        "raw": sections,
        "packages": packages,
        "total": sum(len(lines) for lines in packages.values()),
    }


def openwrt_uci_commit_package(host: str, user: str, package: str) -> dict[str, Any]:
    package = validate_uci_package(package)
    result = ssh_checked(host, user, f"uci commit {package}", timeout=12)
    return {"package": package, **result}


def openwrt_uci_revert_package(host: str, user: str, package: str) -> dict[str, Any]:
    package = validate_uci_package(package)
    result = ssh_checked(host, user, f"uci revert {package}", timeout=12)
    return {"package": package, **result}


def ping_check_status(text: str) -> tuple[str, str]:
    lowered = text.lower()
    if "100% packet loss" in lowered or "bad address" in lowered or "network unreachable" in lowered:
        return "fail", text.splitlines()[-1] if text.splitlines() else "failed"
    if "0% packet loss" in lowered:
        return "pass", "0% packet loss"
    if "% packet loss" in lowered:
        return "warn", text.splitlines()[-1] if text.splitlines() else "partial packet loss"
    if "no default gateway" in lowered:
        return "warn", "no default gateway"
    return "warn", "no clear ping result"


def openwrt_audit(host: str, user: str) -> dict[str, Any]:
    script = r"""
default_route="$(ip route show default 2>/dev/null | head -n 1)"
gateway="$(printf '%s\n' "$default_route" | awk '{for (i=1; i<=NF; i++) if ($i=="via") {print $(i+1); exit}}')"
printf '\n__MX65_SECTION__ release\n'; cat /etc/openwrt_release 2>/dev/null || true
printf '\n__MX65_SECTION__ lan\n'; ifstatus lan 2>/dev/null || true
printf '\n__MX65_SECTION__ wan\n'; ifstatus wan 2>/dev/null || true
printf '\n__MX65_SECTION__ routes\n'; ip route show 2>/dev/null || true
printf '\n__MX65_SECTION__ dhcp_ignore\n'; uci -q get dhcp.lan.ignore 2>/dev/null || echo unknown
printf '\n__MX65_SECTION__ leases\n'; cat /tmp/dhcp.leases 2>/dev/null || true
printf '\n__MX65_SECTION__ dnsmasq\n'; /etc/init.d/dnsmasq status 2>&1 || true
printf '\n__MX65_SECTION__ firewall_service\n'; /etc/init.d/firewall status 2>&1 || true
printf '\n__MX65_SECTION__ fw_check\n'; fw4 check 2>&1 && echo "fw4 check ok" || true
printf '\n__MX65_SECTION__ gateway_ping\n'; if [ -n "$gateway" ]; then ping -c 3 -W 2 "$gateway" 2>&1 || true; else echo "no default gateway"; fi
printf '\n__MX65_SECTION__ internet_ping\n'; ping -c 3 -W 2 1.1.1.1 2>&1 || true
printf '\n__MX65_SECTION__ dns_lookup\n'; nslookup openwrt.org 2>&1 || true
"""
    result = ssh_checked(host, user, script, timeout=45)
    sections = split_sections(result["stdout"])
    lan = parse_json_object(sections.get("lan", ""))
    wan = parse_json_object(sections.get("wan", ""))
    routes = sections.get("routes", "")
    dhcp_ignore = sections.get("dhcp_ignore", "").strip()
    dnsmasq = sections.get("dnsmasq", "")
    firewall_service = sections.get("firewall_service", "")
    fw_check = sections.get("fw_check", "")
    gateway_status, gateway_detail = ping_check_status(sections.get("gateway_ping", ""))
    internet_status, internet_detail = ping_check_status(sections.get("internet_ping", ""))
    dns_lookup = sections.get("dns_lookup", "")
    dns_lower = dns_lookup.lower()
    fw_lower = fw_check.lower()

    checks: list[dict[str, str]] = [
        {
            "label": "OpenWrt target",
            "status": "pass" if "DISTRIB_ID='OpenWrt'" in sections.get("release", "") else "warn",
            "detail": parse_release(sections.get("release", "")).get("DISTRIB_TARGET", "release file readable"),
        },
        {
            "label": "LAN interface",
            "status": "pass" if lan and lan.get("up") else "fail",
            "detail": ifstatus_detail(lan),
        },
        {
            "label": "DHCP serving LAN",
            "status": "pass" if dhcp_ignore == "0" else "fail",
            "detail": f"dhcp.lan.ignore={dhcp_ignore or 'unknown'}",
        },
        {
            "label": "DHCP/DNS service",
            "status": "pass" if "running" in dnsmasq.lower() else "fail",
            "detail": dnsmasq.strip() or "no service output",
        },
        {
            "label": "Firewall service",
            "status": "pass" if "running" in firewall_service.lower() else "warn",
            "detail": firewall_service.strip() or "no service output",
        },
        {
            "label": "Firewall ruleset",
            "status": "fail" if "error" in fw_lower or "failed" in fw_lower else "pass",
            "detail": fw_check.strip() or "fw4 check returned no errors",
        },
        {
            "label": "Default route",
            "status": "pass" if "default" in routes else "warn",
            "detail": next((line for line in routes.splitlines() if line.startswith("default")), "no default route"),
        },
        {
            "label": "Upstream gateway",
            "status": gateway_status,
            "detail": gateway_detail,
        },
        {
            "label": "Internet reachability",
            "status": internet_status,
            "detail": internet_detail,
        },
        {
            "label": "DNS resolution",
            "status": "pass" if "address" in dns_lower and "bad address" not in dns_lower else "warn",
            "detail": dns_lookup.splitlines()[-1] if dns_lookup.splitlines() else "no DNS lookup output",
        },
        {
            "label": "WAN interface",
            "status": "pass" if wan and wan.get("up") else "warn",
            "detail": ifstatus_detail(wan),
        },
    ]
    return {
        "checked_at": datetime.now().isoformat(timespec="seconds"),
        "checks": checks,
        "summary": {
            "pass": sum(1 for check in checks if check["status"] == "pass"),
            "warn": sum(1 for check in checks if check["status"] == "warn"),
            "fail": sum(1 for check in checks if check["status"] == "fail"),
        },
        "lan": lan,
        "wan": wan,
        "raw": sections,
    }


def ifstatus_detail(data: dict[str, Any] | None) -> str:
    if not data:
        return "ifstatus returned no JSON"
    addresses = data.get("ipv4-address") or []
    first = addresses[0] if addresses else {}
    address = first.get("address", "no IPv4")
    mask = first.get("mask")
    return f"{'up' if data.get('up') else 'down'} {address}{('/' + str(mask)) if mask else ''}"


def openwrt_apply_router_manager_package(host: str, user: str, mode: str) -> dict[str, Any]:
    package = build_router_manager_package()
    archive = package["archive"]
    manifest = package["manifest"]
    archive_sha256 = manifest["archive_sha256"]
    ssh_with_input(host, user, "cat > /tmp/mx65-manager-update.tgz", archive, timeout=25)
    script = f"""#!/bin/sh
set -u
pkg=/tmp/mx65-manager-update.tgz
stage=/tmp/mx65-manager-update
expected_archive_sha256={shlex.quote(archive_sha256)}

mkdir -p /etc/mx65-manager /www/mx65 /www/cgi-bin
chmod 755 /www /www/mx65 /www/cgi-bin 2>/dev/null || true
if [ ! -s /etc/mx65-manager/token ]; then
  umask 077
  if command -v hexdump >/dev/null 2>&1; then
    dd if=/dev/urandom bs=32 count=1 2>/dev/null | hexdump -ve '1/1 "%02x"' > /etc/mx65-manager/token
  elif command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32 > /etc/mx65-manager/token
  else
    (date; cat /proc/uptime 2>/dev/null; cat /proc/sys/kernel/random/uuid 2>/dev/null) | sha256sum | awk '{{print $1}}' > /etc/mx65-manager/token
  fi
fi
chmod 700 /etc/mx65-manager 2>/dev/null || true
chmod 600 /etc/mx65-manager/token 2>/dev/null || true

actual_archive_sha256="$(sha256sum "$pkg" | awk '{{print $1}}')"
[ "$actual_archive_sha256" = "$expected_archive_sha256" ] || {{
  printf 'router manager archive SHA256 mismatch: expected %s got %s\\n' "$expected_archive_sha256" "$actual_archive_sha256"
  exit 1
}}

rm -rf "$stage"
mkdir -p "$stage"
tar -xzf "$pkg" -C "$stage"
(
  cd "$stage" || exit 1
  [ -s etc/mx65-manager/manifest.sha256 ] || {{ printf 'router manager manifest.sha256 is missing.\\n'; exit 1; }}
  while read -r expected relpath extra; do
    [ -n "$expected" ] || continue
    case "$relpath" in
      /*|*..*|'') printf 'unsafe manifest path: %s\\n' "$relpath"; exit 1 ;;
    esac
    [ -f "$relpath" ] || {{ printf 'manifest file missing: %s\\n' "$relpath"; exit 1; }}
    actual="$(sha256sum "$relpath" | awk '{{print $1}}')"
    [ "$actual" = "$expected" ] || {{
      printf 'manifest SHA256 mismatch for %s: expected %s got %s\\n' "$relpath" "$expected" "$actual"
      exit 1
    }}
  done < etc/mx65-manager/manifest.sha256
)

mkdir -p /etc/mx65-manager/backups
backup=""
backup_items=""
[ -d /www/mx65 ] && backup_items="$backup_items www/mx65"
[ -f /www/cgi-bin/mx65-api ] && backup_items="$backup_items www/cgi-bin/mx65-api"
[ -f /etc/mx65-manager/manifest.json ] && backup_items="$backup_items etc/mx65-manager/manifest.json"
[ -f /etc/mx65-manager/manifest.sha256 ] && backup_items="$backup_items etc/mx65-manager/manifest.sha256"
[ -f /etc/banner ] && backup_items="$backup_items etc/banner"
if [ -n "$backup_items" ]; then
  backup="/etc/mx65-manager/backups/mx65-manager-$(date +%Y%m%d-%H%M%S).tgz"
  (cd / && tar -czf "$backup" $backup_items 2>/tmp/mx65-manager-backup.log) || {{
    printf 'router manager backup failed.\\n'
    cat /tmp/mx65-manager-backup.log 2>/dev/null || true
    exit 1
  }}
fi

tar -xzf "$pkg" -C /
chmod 755 /www /www/mx65 /www/cgi-bin 2>/dev/null || true
chmod 755 /www/cgi-bin/mx65-api 2>/dev/null || true
chmod 644 /www/mx65/index.html /www/mx65/app.js /www/mx65/styles.css /etc/mx65-manager/manifest.json /etc/mx65-manager/manifest.sha256 /etc/banner 2>/dev/null || true

if [ ! -x /etc/init.d/uhttpd ] && ! command -v uhttpd >/dev/null 2>&1; then
  if command -v apk >/dev/null 2>&1; then
    apk update >/tmp/mx65-uhttpd-install.log 2>&1 || true
    apk add uhttpd >>/tmp/mx65-uhttpd-install.log 2>&1 || true
  elif command -v opkg >/dev/null 2>&1; then
    opkg update >/tmp/mx65-uhttpd-install.log 2>&1 || true
    opkg install uhttpd >>/tmp/mx65-uhttpd-install.log 2>&1 || true
  fi
fi

if command -v uci >/dev/null 2>&1; then
  uci -q delete firewall.mx65_manager_wan_block
  uci set firewall.mx65_manager_wan_block='rule'
  uci set firewall.mx65_manager_wan_block.name='Block My-Rack-E local manager from WAN'
  uci set firewall.mx65_manager_wan_block.src='wan'
  uci set firewall.mx65_manager_wan_block.proto='tcp'
  uci set firewall.mx65_manager_wan_block.dest_port='22 80 443'
  uci set firewall.mx65_manager_wan_block.target='REJECT'
  uci commit firewall
  /etc/init.d/firewall reload >/dev/null 2>&1 || true
fi

if [ -x /etc/init.d/uhttpd ]; then
  if command -v uci >/dev/null 2>&1; then
    uci -q set uhttpd.main.home='/www'
    uci -q set uhttpd.main.cgi_prefix='/cgi-bin'
    uci -q commit uhttpd
  fi
  /etc/init.d/uhttpd enable >/dev/null 2>&1 || true
  /etc/init.d/uhttpd restart >/dev/null 2>&1 || /etc/init.d/uhttpd start >/dev/null 2>&1 || true
fi

lan_ip="$(uci -q get network.lan.ipaddr 2>/dev/null)"
if [ -z "$lan_ip" ]; then
  lan_ip="$(ip -4 addr show br-lan 2>/dev/null | awk '/inet / {{sub(/[/].*/, "", $2); print $2; exit}}')"
fi
[ -n "$lan_ip" ] || lan_ip="192.168.1.1"
printf '__MX65_MANAGER_MODE__ %s\n' {shlex.quote(mode)}
printf '__MX65_MANAGER_VERSION__ %s\n' {shlex.quote(str(manifest["version"]))}
printf '__MX65_MANAGER_ARCHIVE_SHA256__ %s\n' "$actual_archive_sha256"
printf '__MX65_MANAGER_BACKUP__ %s\n' "$backup"
printf '__MX65_MANAGER_URL__ http://%s/mx65/\n' "$lan_ip"
printf '__MX65_MANAGER_TOKEN__ %s\n' "$(cat /etc/mx65-manager/token)"
printf '__MX65_UHTTPD__ '
if [ -x /etc/init.d/uhttpd ]; then
  /etc/init.d/uhttpd status 2>&1 || true
else
  printf 'uhttpd is not installed. Install uhttpd, then rerun deploy.\n'
fi
"""
    result = ssh_run_script(host, user, script, timeout=60)
    url_match = re.search(r"__MX65_MANAGER_URL__\s+(\S+)", result["stdout"])
    token_match = re.search(r"__MX65_MANAGER_TOKEN__\s+(\S+)", result["stdout"])
    version_match = re.search(r"__MX65_MANAGER_VERSION__\s+(\S+)", result["stdout"])
    archive_match = re.search(r"__MX65_MANAGER_ARCHIVE_SHA256__\s+(\S+)", result["stdout"])
    backup_match = re.search(r"__MX65_MANAGER_BACKUP__\s+(\S*)", result["stdout"])
    return {
        "url": url_match.group(1) if url_match else "",
        "token": token_match.group(1) if token_match else "",
        "version": version_match.group(1) if version_match else str(manifest["version"]),
        "archive_sha256": archive_match.group(1) if archive_match else archive_sha256,
        "archive_size": manifest.get("archive_size", len(archive)),
        "backup": backup_match.group(1) if backup_match else "",
        "files": [
            "/www/mx65/index.html",
            "/www/mx65/app.js",
            "/www/mx65/styles.css",
            "/www/cgi-bin/mx65-api",
            "/etc/banner",
            "/etc/mx65-manager/manifest.json",
            "/etc/mx65-manager/manifest.sha256",
            "/etc/mx65-manager/token",
        ],
        "stdout": re.sub(r"(__MX65_MANAGER_TOKEN__\s+)\S+", r"\1[redacted]", result["stdout"]),
        "stderr": result["stderr"],
    }


def openwrt_deploy_router_manager(host: str, user: str) -> dict[str, Any]:
    return openwrt_apply_router_manager_package(host, user, "deploy")


def openwrt_update_router_manager(host: str, user: str) -> dict[str, Any]:
    return openwrt_apply_router_manager_package(host, user, "update")


def openwrt_router_manager_status(host: str, user: str) -> dict[str, Any]:
    script = r"""
lan_ip="$(uci -q get network.lan.ipaddr 2>/dev/null)"
if [ -z "$lan_ip" ]; then
  lan_ip="$(ip -4 addr show br-lan 2>/dev/null | awk '/inet / {sub(/\/.*/, "", $2); print $2; exit}')"
fi
[ -n "$lan_ip" ] || lan_ip="192.168.1.1"
printf '__MX65_MANAGER_URL__ http://%s/mx65/\n' "$lan_ip"
printf '__MX65_MANAGER_TOKEN_PRESENT__ '
[ -s /etc/mx65-manager/token ] && printf 'yes\n' || printf 'no\n'
printf '__MX65_MANAGER_UHTTPD__ '
if [ -x /etc/init.d/uhttpd ]; then
  /etc/init.d/uhttpd status 2>&1 || true
else
  printf 'missing\n'
fi
printf '__MX65_MANAGER_WAN_BLOCK__ '
uci -q get firewall.mx65_manager_wan_block.target 2>/dev/null || printf 'missing'
printf '\n__MX65_MANAGER_MANIFEST__\n'
cat /etc/mx65-manager/manifest.json 2>/dev/null || printf '{}\n'
printf '\n__MX65_MANAGER_VERIFY__\n'
if [ -s /etc/mx65-manager/manifest.sha256 ]; then
  (cd / && while read -r expected relpath extra; do
    [ -n "$expected" ] || continue
    if [ ! -f "$relpath" ]; then
      printf '%s: MISSING\n' "$relpath"
      continue
    fi
    actual="$(sha256sum "$relpath" | awk '{print $1}')"
    if [ "$actual" = "$expected" ]; then
      printf '%s: OK\n' "$relpath"
    else
      printf '%s: FAILED\n' "$relpath"
    fi
  done < /etc/mx65-manager/manifest.sha256)
else
  printf 'manifest.sha256 missing\n'
fi
printf '\n__MX65_MANAGER_BACKUPS__\n'
ls -1t /etc/mx65-manager/backups/mx65-manager-*.tgz 2>/dev/null | head -5 || true
"""
    result = ssh_run_script(host, user, script, timeout=20)
    stdout = result["stdout"]
    url_match = re.search(r"__MX65_MANAGER_URL__\s+(\S+)", stdout)
    token_match = re.search(r"__MX65_MANAGER_TOKEN_PRESENT__\s+(\S+)", stdout)
    manifest_match = re.search(r"__MX65_MANAGER_MANIFEST__\n(.*?)\n__MX65_MANAGER_VERIFY__", stdout, re.S)
    manifest: dict[str, Any] = {}
    if manifest_match:
        try:
            parsed = json.loads(manifest_match.group(1).strip() or "{}")
            if isinstance(parsed, dict):
                manifest = parsed
        except json.JSONDecodeError:
            manifest = {}
    return {
        "url": url_match.group(1) if url_match else "",
        "token_present": token_match.group(1) == "yes" if token_match else False,
        "manifest": manifest,
        "stdout": stdout,
        "stderr": result["stderr"],
    }


def openwrt_rollback_router_manager(host: str, user: str) -> dict[str, Any]:
    script = r"""
backup="$(ls -1t /etc/mx65-manager/backups/mx65-manager-*.tgz 2>/dev/null | head -1)"
[ -n "$backup" ] || { printf 'No router manager backup is available.\n'; exit 1; }
case "$backup" in
  /etc/mx65-manager/backups/mx65-manager-*.tgz) ;;
  *) printf 'Unsafe backup path: %s\n' "$backup"; exit 1 ;;
esac
tar -xzf "$backup" -C /
chmod 755 /www/cgi-bin/mx65-api 2>/dev/null || true
chmod 644 /www/mx65/index.html /www/mx65/app.js /www/mx65/styles.css /etc/mx65-manager/manifest.json /etc/mx65-manager/manifest.sha256 /etc/banner 2>/dev/null || true
if [ -x /etc/init.d/uhttpd ]; then
  /etc/init.d/uhttpd restart >/dev/null 2>&1 || true
fi
printf '__MX65_MANAGER_ROLLBACK__ %s\n' "$backup"
"""
    result = ssh_run_script(host, user, script, timeout=30)
    backup_match = re.search(r"__MX65_MANAGER_ROLLBACK__\s+(\S+)", result["stdout"])
    return {
        "backup": backup_match.group(1) if backup_match else "",
        "stdout": result["stdout"],
        "stderr": result["stderr"],
    }


def validate_tunnel_token(token: str) -> str:
    token = token.strip()
    if not 20 <= len(token) <= 5000:
        raise ValueError("Cloudflare tunnel token length is not valid.")
    if re.search(r"[\s\x00]", token):
        raise ValueError("Cloudflare tunnel token must not contain whitespace.")
    return token


def cloudflared_asset_for_arch(arch: str) -> str:
    arch = arch.lower()
    if arch in {"aarch64", "arm64"}:
        return "cloudflared-linux-arm64"
    if arch in {"x86_64", "amd64"}:
        return "cloudflared-linux-amd64"
    if arch in {"i386", "i686", "386"}:
        return "cloudflared-linux-386"
    return "cloudflared-linux-arm"


def fetch_cloudflared_release_asset(asset_name: str) -> dict[str, str]:
    release = fetch_json(CLOUDFLARED_LATEST_RELEASE_API, timeout=20)
    assets = release.get("assets", [])
    if not isinstance(assets, list):
        raise ValueError("Cloudflared release metadata did not include assets.")
    asset = next((item for item in assets if isinstance(item, dict) and item.get("name") == asset_name), None)
    if not asset:
        raise ValueError(f"Cloudflared release did not include {asset_name}.")
    download_url = str(asset.get("browser_download_url") or "")
    if not download_url.startswith("https://github.com/cloudflare/cloudflared/releases/download/"):
        raise ValueError(f"Unexpected cloudflared download URL for {asset_name}.")
    body = str(release.get("body", ""))
    checksum_match = re.search(rf"(?m)^\s*{re.escape(asset_name)}:\s*([0-9a-fA-F]{{64}})\s*$", body)
    if not checksum_match:
        raise ValueError(f"Cloudflared release checksum was not found for {asset_name}.")
    return {
        "tag": str(release.get("tag_name", "")),
        "asset": asset_name,
        "download_url": download_url,
        "sha256": checksum_match.group(1).lower(),
    }


def openwrt_cloudflare_status(host: str, user: str) -> dict[str, Any]:
    script = r"""
printf '__ binary __\n'
if command -v cloudflared >/dev/null 2>&1; then
  cloudflared --version 2>&1
else
  printf 'cloudflared is not installed.\n'
fi
printf '\n__ service __\n'
if [ -x /etc/init.d/cloudflared ]; then
  /etc/init.d/cloudflared enabled >/dev/null 2>&1 && printf 'enabled\n' || printf 'disabled\n'
  /etc/init.d/cloudflared status 2>&1 || true
else
  printf 'cloudflared init script is not installed.\n'
fi
printf '\n__ logs __\n'
logread -e cloudflared -l 120 2>/dev/null || true
"""
    return ssh_run_script(host, user, script, timeout=20)


def openwrt_cloudflare_install(host: str, user: str, token: str) -> dict[str, Any]:
    token = validate_tunnel_token(token)
    arch_result = ssh_checked(host, user, "uname -m", timeout=10)
    asset = cloudflared_asset_for_arch(arch_result["stdout"].strip())
    release_asset = fetch_cloudflared_release_asset(asset)
    url = release_asset["download_url"]
    expected_sha256 = release_asset["sha256"]
    script = f"""#!/bin/sh
set -u
mkdir -p /etc/cloudflared
umask 077
cat > /etc/cloudflared/token <<'MX65_CLOUDFLARED_TOKEN'
{token}
MX65_CLOUDFLARED_TOKEN
chmod 700 /etc/cloudflared 2>/dev/null || true
chmod 600 /etc/cloudflared/token 2>/dev/null || true

download_url={shlex.quote(url)}
expected_sha256={shlex.quote(expected_sha256)}
rm -f /tmp/cloudflared
if command -v wget >/dev/null 2>&1; then
  wget -O /tmp/cloudflared "$download_url" 2>/tmp/mx65-cloudflared-download.log || true
elif command -v curl >/dev/null 2>&1; then
  curl -L -o /tmp/cloudflared "$download_url" >/tmp/mx65-cloudflared-download.log 2>&1 || true
fi
if [ ! -s /tmp/cloudflared ]; then
  if command -v apk >/dev/null 2>&1; then
    apk update >>/tmp/mx65-cloudflared-download.log 2>&1 || true
    apk add ca-bundle wget >>/tmp/mx65-cloudflared-download.log 2>&1 || true
  elif command -v opkg >/dev/null 2>&1; then
    opkg update >>/tmp/mx65-cloudflared-download.log 2>&1 || true
    opkg install ca-bundle wget-ssl >>/tmp/mx65-cloudflared-download.log 2>&1 || true
  fi
  if command -v wget >/dev/null 2>&1; then
    wget -O /tmp/cloudflared "$download_url" >>/tmp/mx65-cloudflared-download.log 2>&1 || true
  elif command -v curl >/dev/null 2>&1; then
    curl -L -o /tmp/cloudflared "$download_url" >>/tmp/mx65-cloudflared-download.log 2>&1 || true
  fi
fi
[ -s /tmp/cloudflared ] || {{ printf 'cloudflared download failed.\\n'; cat /tmp/mx65-cloudflared-download.log 2>/dev/null; exit 1; }}
actual_sha256="$(sha256sum /tmp/cloudflared | awk '{{print $1}}')"
[ "$actual_sha256" = "$expected_sha256" ] || {{ printf 'cloudflared SHA256 mismatch: expected %s got %s\\n' "$expected_sha256" "$actual_sha256"; exit 1; }}
if command -v install >/dev/null 2>&1; then
  install -m 755 /tmp/cloudflared /usr/bin/cloudflared 2>/tmp/mx65-cloudflared-install.log || true
fi
if [ ! -x /usr/bin/cloudflared ]; then
  cp /tmp/cloudflared /usr/bin/cloudflared 2>>/tmp/mx65-cloudflared-install.log || true
  chmod 755 /usr/bin/cloudflared 2>>/tmp/mx65-cloudflared-install.log || true
fi
[ -x /usr/bin/cloudflared ] || {{ printf 'cloudflared install failed.\\n'; cat /tmp/mx65-cloudflared-install.log 2>/dev/null; ls -l /tmp/cloudflared /usr/bin/cloudflared 2>/dev/null || true; exit 1; }}

cat > /usr/bin/cloudflared-run <<'MX65_RUN'
#!/bin/sh
TOKEN="$(cat /etc/cloudflared/token 2>/dev/null)"
if [ -z "$TOKEN" ]; then
  echo "cloudflared token missing"
  exit 1
fi
exec /usr/bin/cloudflared tunnel --no-autoupdate run --token "$TOKEN"
MX65_RUN
chmod 755 /usr/bin/cloudflared-run

cat > /etc/init.d/cloudflared <<'MX65_INIT'
#!/bin/sh /etc/rc.common
START=95
STOP=10
USE_PROCD=1

start_service() {{
  procd_open_instance
  procd_set_param command /usr/bin/cloudflared-run
  procd_set_param respawn 3600 5 5
  procd_set_param stdout 1
  procd_set_param stderr 1
  procd_close_instance
}}
MX65_INIT
chmod 755 /etc/init.d/cloudflared
/etc/init.d/cloudflared enable
/etc/init.d/cloudflared restart
printf '__MX65_CLOUDFLARED_ASSET__ %s\\n' {shlex.quote(asset)}
printf '__MX65_CLOUDFLARED_URL__ %s\\n' "$download_url"
/usr/bin/cloudflared --version 2>&1 || true
/etc/init.d/cloudflared status 2>&1 || true
"""
    result = ssh_run_script(host, user, script, timeout=120)
    return {
        "asset": asset,
        "download_url": url,
        "version": release_asset["tag"],
        "sha256": expected_sha256,
        "stdout": re.sub(r"(token\s+)[A-Za-z0-9_.=-]{20,}", r"\1[redacted]", result["stdout"], flags=re.IGNORECASE),
        "stderr": result["stderr"],
    }


def openwrt_service_action(host: str, user: str, service: str, action: str) -> dict[str, Any]:
    service = service.strip()
    action = action.strip()
    if service not in {"network", "firewall", "dnsmasq", "odhcpd", "dropbear", "cloudflared"}:
        raise ValueError("Unsupported service.")
    if action not in {"status", "start", "stop", "restart", "reload", "enable", "disable"}:
        raise ValueError("Unsupported service action.")
    return ssh_checked(host, user, f"/etc/init.d/{service} {action} 2>&1", timeout=25)


def openwrt_diagnostic(host: str, user: str, kind: str, target: str = "") -> dict[str, Any]:
    kind = kind.strip()
    target = target.strip()
    if kind in {"ping", "nslookup", "traceroute"}:
        if not re.fullmatch(r"[A-Za-z0-9_.:-]{1,255}", target):
            raise ValueError("Diagnostic target must be a hostname or IP address.")
    command_map = {
        "ping": f"ping -c 4 {shlex.quote(target)}",
        "nslookup": f"nslookup {shlex.quote(target)}",
        "traceroute": f"traceroute {shlex.quote(target)}",
        "routes": "ip route show",
        "firewall-check": "fw4 check 2>&1",
        "logs": "logread -l 200 2>/dev/null || dmesg | tail -200",
    }
    command = command_map.get(kind)
    if not command:
        raise ValueError("Unsupported diagnostic.")
    return ssh_checked(host, user, command, timeout=35)


def valid_ipv4(value: str) -> bool:
    parts = value.split(".")
    if len(parts) != 4:
        return False
    try:
        return all(0 <= int(part) <= 255 and str(int(part)) == part for part in parts)
    except ValueError:
        return False


def openwrt_add_port_forward(host: str, user: str, data: dict[str, Any]) -> dict[str, Any]:
    name = validate_router_value(str(data.get("name", "")), 64) or "GUI port forward"
    proto = str(data.get("proto", "tcp")).lower()
    src_dport = str(data.get("src_dport", "")).strip()
    dest_ip = str(data.get("dest_ip", "")).strip()
    dest_port = str(data.get("dest_port", "")).strip()
    if proto not in {"tcp", "udp", "tcp udp"}:
        raise ValueError("Protocol must be tcp, udp, or tcp udp.")
    if not src_dport.isdigit() or not 1 <= int(src_dport) <= 65535:
        raise ValueError("Source port must be 1-65535.")
    if not dest_port.isdigit() or not 1 <= int(dest_port) <= 65535:
        raise ValueError("Destination port must be 1-65535.")
    if not valid_ipv4(dest_ip):
        raise ValueError("Destination IP must be IPv4.")
    lines = [
        "uci add firewall redirect",
        f"uci set firewall.@redirect[-1].name={shlex.quote(name)}",
        "uci set firewall.@redirect[-1].src='wan'",
        "uci set firewall.@redirect[-1].dest='lan'",
        "uci set firewall.@redirect[-1].target='DNAT'",
        f"uci set firewall.@redirect[-1].proto={shlex.quote(proto)}",
        f"uci set firewall.@redirect[-1].src_dport={shlex.quote(src_dport)}",
        f"uci set firewall.@redirect[-1].dest_ip={shlex.quote(dest_ip)}",
        f"uci set firewall.@redirect[-1].dest_port={shlex.quote(dest_port)}",
        "uci commit firewall",
        "fw4 check",
        "/etc/init.d/firewall reload",
    ]
    return ssh_checked(host, user, " && ".join(lines), timeout=30)


def openwrt_add_dhcp_host(host: str, user: str, data: dict[str, Any]) -> dict[str, Any]:
    name = validate_router_value(str(data.get("name", "")), 64)
    mac = str(data.get("mac", "")).strip().lower()
    ip = str(data.get("ip", "")).strip()
    if not name:
        raise ValueError("Host name is required.")
    if not re.fullmatch(r"[0-9a-f]{2}(:[0-9a-f]{2}){5}", mac):
        raise ValueError("MAC address must look like aa:bb:cc:dd:ee:ff.")
    if not valid_ipv4(ip):
        raise ValueError("IP must be IPv4.")
    lines = [
        "uci add dhcp host",
        f"uci set dhcp.@host[-1].name={shlex.quote(name)}",
        f"uci set dhcp.@host[-1].mac={shlex.quote(mac)}",
        f"uci set dhcp.@host[-1].ip={shlex.quote(ip)}",
        "uci commit dhcp",
        "/etc/init.d/dnsmasq restart",
    ]
    return ssh_checked(host, user, " && ".join(lines), timeout=25)


def validate_dhcp_number(value: str, label: str) -> str:
    value = value.strip()
    if not value.isdigit() or not 1 <= int(value) <= 254:
        raise ValueError(f"{label} must be a number from 1 to 254.")
    return value


def normalize_gateway_input(value: str, netmask: str) -> tuple[str, str]:
    value = value.strip()
    netmask = netmask.strip() or "255.255.255.0"
    try:
        if "/" in value:
            interface = ipaddress.IPv4Interface(value)
        else:
            prefix = ipaddress.IPv4Network(f"0.0.0.0/{netmask}").prefixlen
            interface = ipaddress.IPv4Interface(f"{value}/{prefix}")
    except ValueError as exc:
        raise ValueError("LAN address must be a gateway IP or subnet CIDR, for example 10.69.69.0/24.") from exc
    network = interface.network
    if network.prefixlen < 1 or network.prefixlen > 30:
        raise ValueError("LAN subnet must have a usable gateway address.")
    gateway = interface.ip
    if gateway == network.network_address:
        gateway = ipaddress.IPv4Address(int(network.network_address) + 1)
    if gateway == network.broadcast_address:
        raise ValueError("LAN gateway cannot be the broadcast address.")
    return str(gateway), str(network.netmask)


def automatic_dhcp_pool(network: ipaddress.IPv4Network, gateway: ipaddress.IPv4Address) -> tuple[int, int]:
    last_usable = network.num_addresses - 2
    gateway_offset = int(gateway) - int(network.network_address)
    if last_usable >= 200:
        start_offset = 50
        end_offset = 199
    elif last_usable >= 100:
        start_offset = 20
        end_offset = last_usable - 10
    elif last_usable >= 50:
        start_offset = 10
        end_offset = last_usable
    else:
        start_offset = gateway_offset + 1
        end_offset = last_usable
    if start_offset <= gateway_offset <= end_offset:
        start_offset = gateway_offset + 1
    if end_offset < start_offset:
        end_offset = last_usable
    if start_offset > last_usable:
        raise ValueError("DHCP range has no usable client addresses after the gateway.")
    return start_offset, end_offset - start_offset + 1


def normalize_dhcp_pool(ipaddr: str, netmask: str, start: str, limit: str) -> tuple[str, str, str, str]:
    interface = ipaddress.IPv4Interface(f"{ipaddr}/{netmask}")
    network = interface.network
    gateway = interface.ip
    last_usable = network.num_addresses - 2
    gateway_offset = int(gateway) - int(network.network_address)
    if network.prefixlen < 1 or network.prefixlen > 30 or last_usable < 1:
        raise ValueError("LAN subnet must have usable DHCP addresses.")
    start = start.strip()
    limit = limit.strip()
    if start in ("", "auto"):
        start_offset, pool_limit = automatic_dhcp_pool(network, gateway)
    else:
        if "." in start:
            try:
                start_ip = ipaddress.IPv4Address(start)
            except ValueError as exc:
                raise ValueError("DHCP first client must be a valid IPv4 address.") from exc
            if start_ip not in network:
                raise ValueError("DHCP first client must be inside the selected subnet.")
            start_offset = int(start_ip) - int(network.network_address)
        else:
            if not start.isdigit():
                raise ValueError("DHCP first client must be an IP address or host number.")
            start_offset = int(start)
        if not limit.isdigit() or int(limit) < 1:
            raise ValueError("DHCP size must be at least 1.")
        pool_limit = int(limit)
    end_offset = start_offset + pool_limit - 1
    if start_offset < 1:
        raise ValueError("DHCP first client cannot be the network address.")
    if start_offset > last_usable:
        raise ValueError("DHCP first client is outside the selected subnet.")
    if end_offset > last_usable:
        raise ValueError("DHCP range reaches the broadcast address; reduce the size.")
    if start_offset <= gateway_offset <= end_offset:
        raise ValueError("DHCP range overlaps the gateway. Move the first client after the gateway or use automatic DHCP.")
    start_ip = ipaddress.IPv4Address(int(network.network_address) + start_offset)
    end_ip = ipaddress.IPv4Address(int(network.network_address) + end_offset)
    return str(start_offset), str(pool_limit), str(start_ip), str(end_ip)


def openwrt_lan_profile(host: str, user: str, data: dict[str, Any]) -> dict[str, Any]:
    ipaddr = str(data.get("ipaddr", "")).strip()
    netmask = str(data.get("netmask", "")).strip() or "255.255.255.0"
    dhcp_start = str(data.get("dhcp_start", "auto")).strip()
    dhcp_limit = str(data.get("dhcp_limit", "150")).strip()
    commit = bool(data.get("commit", False))
    ipaddr, netmask = normalize_gateway_input(ipaddr, netmask)
    dhcp_start, dhcp_limit, dhcp_start_ip, dhcp_end_ip = normalize_dhcp_pool(ipaddr, netmask, dhcp_start, dhcp_limit)

    backup_name = f"/root/mx65-gui-lan-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}.uci"
    lines = [
        f"(uci export network; echo; uci export dhcp) > {backup_name}",
        "uci set network.lan.proto='static'",
        f"uci set network.lan.ipaddr={shlex.quote(ipaddr)}",
        f"uci set network.lan.netmask={shlex.quote(netmask)}",
        "uci -q delete network.lan.gateway",
        "uci -q delete network.lan.dns",
        "uci set dhcp.lan.ignore='0'",
        f"uci set dhcp.lan.start={shlex.quote(dhcp_start)}",
        f"uci set dhcp.lan.limit={shlex.quote(dhcp_limit)}",
        "uci set dhcp.lan.leasetime='12h'",
    ]
    plan = lines + ["uci commit network", "uci commit dhcp", "reboot"]
    if not commit:
        return {
            "committed": False,
            "backup": backup_name,
            "plan": "\n".join(plan),
            "dhcp_start_ip": dhcp_start_ip,
            "dhcp_end_ip": dhcp_end_ip,
        }

    result = ssh_checked(host, user, " && ".join(lines + ["uci commit network", "uci commit dhcp"]), timeout=20)
    return {
        "committed": True,
        "backup": backup_name,
        "ipaddr": ipaddr,
        "netmask": netmask,
        "dhcp_start": dhcp_start,
        "dhcp_limit": dhcp_limit,
        "dhcp_start_ip": dhcp_start_ip,
        "dhcp_end_ip": dhcp_end_ip,
        "stdout": result["stdout"],
        "stderr": result["stderr"],
        "next_step": "Reboot when ready. The app does not restart network automatically.",
    }


def router_probe(host: str, user: str) -> dict[str, Any]:
    commands = {
        "openwrt_release": "cat /etc/openwrt_release 2>/dev/null || true",
        "system_board": "ubus call system board 2>/dev/null || true",
        "interfaces": "ip -brief addr 2>/dev/null || ip addr show",
        "routes": "ip route show 2>/dev/null || true",
        "firewall": "fw4 check 2>&1 || true",
    }
    outputs: dict[str, Any] = {}
    ok = True
    for name, command in commands.items():
        result = ssh_command(host, user, command)
        outputs[name] = {
            "returncode": result.returncode,
            "stdout": decode_output(result.stdout)[:MAX_TEXT_FIELD],
            "stderr": decode_output(result.stderr)[:4000],
        }
        if name in {"openwrt_release", "system_board"} and result.returncode != 0:
            ok = False
    return {"ok": ok, "host": host, "user": user, "outputs": outputs}


def router_backup(host: str, user: str) -> dict[str, Any]:
    host, user = validate_ssh_target(host, user)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    outdir = BACKUPS_DIR / f"openwrt-{host.replace(':', '_')}-{stamp}"
    outdir.mkdir(parents=True, exist_ok=True)
    text_commands = {
        "openwrt_release.txt": "cat /etc/openwrt_release 2>/dev/null || true",
        "system_board.json": "ubus call system board 2>/dev/null || true",
        "uci-export.txt": "uci export 2>/dev/null || true",
        "network-status.txt": "ip addr show; echo; ip route show; echo; ifstatus lan 2>/dev/null; ifstatus wan 2>/dev/null",
        "firewall-rendered.txt": "fw4 print 2>/dev/null || iptables-save 2>/dev/null || true",
        "packages.txt": "apk list --installed 2>/dev/null || opkg list-installed 2>/dev/null || true",
    }
    files: list[str] = []
    for filename, command in text_commands.items():
        result = ssh_command(host, user, command, timeout=15)
        target = outdir / filename
        target.write_bytes(result.stdout + (b"\n--- stderr ---\n" + result.stderr if result.stderr else b""))
        files.append(str(target))

    sysupgrade = ssh_command(host, user, "sysupgrade -b -", timeout=30)
    if sysupgrade.returncode == 0 and sysupgrade.stdout:
        target = outdir / "sysupgrade-backup.tar.gz"
        target.write_bytes(sysupgrade.stdout)
        files.append(str(target))
    else:
        target = outdir / "sysupgrade-backup-error.txt"
        target.write_text(decode_output(sysupgrade.stderr), encoding="utf-8")
        files.append(str(target))

    return {"path": str(outdir), "files": files}


def parse_mtd(text: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line in text.splitlines():
        match = re.match(r"mtd(\d+):\s+([0-9a-fA-F]+)\s+([0-9a-fA-F]+)\s+\"([^\"]+)\"", line.strip())
        if not match:
            continue
        index, size_hex, erase_hex, name = match.groups()
        size = int(size_hex, 16)
        erase = int(erase_hex, 16)
        rows.append(
            {
                "mtd": f"mtd{index}",
                "device": f"/dev/mtdblock{index}",
                "size_hex": "0x" + size_hex.lower(),
                "erase_hex": "0x" + erase_hex.lower(),
                "size_bytes": size,
                "size_kib": round(size / 1024, 1),
                "erase_bytes": erase,
                "name": name,
                "risk_hint": "bootloader-candidate" if index == "0" or "boot" in name.lower() else "data",
            }
        )
    return rows


def render_export_markdown(state: dict[str, Any], profile_data: dict[str, Any]) -> str:
    image = extract_profile_image(profile_data) or {}
    lines = [
        "# MX65 OpenWrt Flash Session Notes",
        "",
        f"- Exported: {datetime.now().isoformat(timespec='seconds')}",
        f"- App profile: OpenWrt {profile_data.get('version_number')} {profile_data.get('target')} {profile_data.get('profile_id')}",
        f"- Profile URL: {profile_data.get('profile_url')}",
        f"- Source definition: {profile_data.get('source_makefile_url')}",
        f"- Expected sysupgrade image: `{image.get('name', 'unknown')}`",
        f"- Expected sysupgrade SHA256: `{image.get('sha256', 'unknown')}`",
        "",
        "## Gate Status",
    ]

    gates = state.get("gateSummary", [])
    if isinstance(gates, list) and gates:
        for gate in gates:
            label = truncate_text(gate.get("label", "Step"))
            status = "PASS" if gate.get("pass") else "BLOCKED"
            lines.append(f"- {label}: {status}")
            for reason in gate.get("reasons", []):
                lines.append(f"  - {truncate_text(reason, 500)}")
    else:
        lines.append("- No gate summary was included by the browser.")

    lines.extend(["", "## Captured Evidence"])
    for section_name in ["device", "images", "flashDrive", "preflight", "bootloader", "openwrt", "management", "baseline"]:
        section = state.get(section_name, {})
        lines.extend(["", f"### {section_name.title()}"])
        if isinstance(section, dict):
            for key, value in section.items():
                if key in {"sysupgradeHash", "ubootHash", "usbCheck", "mtdParsed", "volumeInfo", "stageResult", "probeResult", "backupResult"}:
                    lines.append(f"- {key}:")
                    lines.append("```json")
                    lines.append(json.dumps(value, indent=2, sort_keys=True))
                    lines.append("```")
                elif isinstance(value, bool):
                    lines.append(f"- {key}: `{value}`")
                else:
                    safe = truncate_text(value)
                    if "\n" in safe:
                        lines.append(f"- {key}:")
                        lines.append("```text")
                        lines.append(safe)
                        lines.append("```")
                    else:
                        lines.append(f"- {key}: `{safe}`")

    lines.extend(
        [
            "",
            "## Non-Automated Destructive Step",
            "",
            "This guide intentionally did not run a bootloader write, `dd`, `mtd`, or `sysupgrade` command.",
            "Manually verify any destructive command against the current device-specific instructions, the exact model label, `/proc/mtd`, serial console output, and file checksums.",
            "",
        ]
    )
    return "\n".join(lines)


class GuideHandler(BaseHTTPRequestHandler):
    server_version = "MyRackESetup/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def send_json(self, payload: Any, status: int = 200) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(data)

    def send_text(self, text: str, status: int = 200, content_type: str = "text/plain; charset=utf-8") -> None:
        data = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if content_type.startswith("text/html"):
            self.send_header(
                "Content-Security-Policy",
                "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
            )
        self.end_headers()
        self.wfile.write(data)

    def read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length > MAX_JSON_BYTES:
            raise ValueError("JSON body is too large.")
        raw = self.rfile.read(length)
        if not raw:
            return {}
        payload = json.loads(raw.decode("utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("Expected a JSON object.")
        return payload

    def _router_host(self, payload: dict[str, Any] | None = None) -> str:
        if not isinstance(payload, dict):
            return DEFAULT_ROUTER_HOST
        host = str(payload.get("host", "")).strip()
        if host:
            return host
        return DEFAULT_ROUTER_HOST

    def require_token(self) -> bool:
        provided = self.headers.get("X-MX65-Token", "")
        if not secrets.compare_digest(provided, SESSION_TOKEN):
            self.send_json({"ok": False, "error": "Invalid local session token."}, status=HTTPStatus.FORBIDDEN)
            return False
        return True

    def do_GET(self) -> None:
        path = urlsplit(self.path).path

        if path == "/" or path == "/index.html":
            index = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
            index = index.replace("__SESSION_TOKEN__", html.escape(SESSION_TOKEN, quote=True))
            self.send_text(index, content_type="text/html; charset=utf-8")
            return

        if path == "/manage" or path == "/manage.html":
            index = (STATIC_DIR / "manage.html").read_text(encoding="utf-8")
            index = index.replace("__SESSION_TOKEN__", html.escape(SESSION_TOKEN, quote=True))
            self.send_text(index, content_type="text/html; charset=utf-8")
            return

        if path == "/api/health":
            self.send_json({"ok": True, "service": "myracke-dashboard", "time": time.time()})
            return

        if path == "/api/device-profiles":
            if not self.require_token():
                return
            self.send_json({"ok": True, "default_profile_id": DEFAULT_DEVICE_PROFILE_ID, "profiles": load_device_profiles()})
            return

        if path == "/api/profile":
            if not self.require_token():
                return
            self.send_json({"ok": True, "profile": load_cached_profile()})
            return

        if path == "/api/download/status":
            if not self.require_token():
                return
            self.send_json({"ok": True, "download": official_download_status(load_cached_profile())})
            return

        if path == "/api/conversion/status":
            if not self.require_token():
                return
            self.send_json({"ok": True, "bundle": conversion_bundle_status()})
            return

        if path == "/api/volumes":
            if not self.require_token():
                return
            self.send_json({"ok": True, "volumes": list_usb_candidates()})
            return

        if path == "/api/format/disks":
            if not self.require_token():
                return
            try:
                self.send_json({"ok": True, "disks": list_format_disks(), "erase_phrase": ERASE_PHRASE})
            except Exception as exc:
                self.send_json({"ok": True, "disks": [], "erase_phrase": ERASE_PHRASE, "error": str(exc)})
            return

        if path.startswith("/static/"):
            rel = path.removeprefix("/static/")
            target = (STATIC_DIR / rel).resolve()
            if STATIC_DIR.resolve() not in target.parents or not target.is_file():
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            suffix = target.suffix.lower()
            content_type = {
                ".css": "text/css; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".svg": "image/svg+xml",
                ".html": "text/html; charset=utf-8",
            }.get(suffix, "application/octet-stream")
            self.send_text(target.read_text(encoding="utf-8"), content_type=content_type)
            return

        self.send_error(HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        if not self.path.startswith("/api/"):
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if not self.require_token():
            return

        try:
            payload = self.read_json()
            if self.path == "/api/profile/live":
                try:
                    profile = fetch_latest_mx65_profile()
                    self.send_json({"ok": True, "profile": profile, "live": True})
                except (URLError, TimeoutError, RuntimeError, OSError) as exc:
                    self.send_json({"ok": False, "error": str(exc), "profile": load_cached_profile(), "live": False}, status=502)
                return

            if self.path == "/api/device-profiles/live":
                try:
                    live = fetch_latest_meraki_mx_profiles()
                    self.send_json({"ok": True, "live": live})
                except (URLError, TimeoutError, RuntimeError, OSError) as exc:
                    self.send_json({"ok": False, "error": str(exc), "profiles": load_device_profiles(), "live": None}, status=502)
                return

            if self.path == "/api/hash":
                raw_path = str(payload.get("path", "")).strip()
                if not raw_path:
                    raise ValueError("File path is required.")
                target = Path(raw_path).expanduser()
                if not target.is_file():
                    raise ValueError(f"File not found: {target}")
                digest, size = sha256_file(target)
                cached = load_cached_profile()
                expected = extract_profile_image(cached) or {}
                self.send_json(
                    {
                        "ok": True,
                        "path": str(target),
                        "name": target.name,
                        "size": size,
                        "sha256": digest,
                        "matches_official_sysupgrade": digest == expected.get("sha256"),
                        "official_sysupgrade_name": expected.get("name"),
                        "official_sysupgrade_sha256": expected.get("sha256"),
                    }
                )
                return

            if self.path == "/api/download/sysupgrade":
                result = download_official_sysupgrade(load_cached_profile())
                self.send_json({"ok": True, "download": result})
                return

            if self.path == "/api/conversion/download":
                result = download_stock_conversion_bundle(str(payload.get("profile_id") or DEFAULT_DEVICE_PROFILE_ID))
                self.send_json({"ok": True, "bundle": result})
                return

            if self.path == "/api/openwrt/key":
                self.send_json({"ok": True, "key": ensure_gui_ssh_key()})
                return

            if self.path == "/api/openwrt/snapshot":
                result = openwrt_snapshot(self._router_host(payload), str(payload.get("user", "root")))
                self.send_json({"ok": True, "snapshot": result})
                return

            if self.path == "/api/openwrt/uci-set":
                result = openwrt_uci_set(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    str(payload.get("path", "")),
                    str(payload.get("value", "")),
                    commit=bool(payload.get("commit", False)),
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/uci-changes":
                result = openwrt_uci_changes(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                )
                self.send_json({"ok": True, "changes": result})
                return

            if self.path == "/api/openwrt/uci-commit":
                result = openwrt_uci_commit_package(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    str(payload.get("package", "")),
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/uci-revert":
                result = openwrt_uci_revert_package(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    str(payload.get("package", "")),
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/audit":
                result = openwrt_audit(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                )
                self.send_json({"ok": True, "audit": result})
                return

            if self.path == "/api/openwrt/service":
                result = openwrt_service_action(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    str(payload.get("service", "")),
                    str(payload.get("action", "")),
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/diagnostic":
                result = openwrt_diagnostic(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    str(payload.get("kind", "")),
                    str(payload.get("target", "")),
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/firewall/redirect":
                result = openwrt_add_port_forward(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    payload,
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/dhcp/host":
                result = openwrt_add_dhcp_host(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    payload,
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/lan-profile":
                result = openwrt_lan_profile(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    payload,
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/router-manager/deploy":
                result = openwrt_deploy_router_manager(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                )
                self.send_json({"ok": True, "deploy": result})
                return

            if self.path == "/api/openwrt/router-manager/status":
                result = openwrt_router_manager_status(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                )
                self.send_json({"ok": True, "manager": result})
                return

            if self.path == "/api/openwrt/router-manager/update":
                result = openwrt_update_router_manager(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                )
                self.send_json({"ok": True, "update": result})
                return

            if self.path == "/api/openwrt/router-manager/rollback":
                result = openwrt_rollback_router_manager(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                )
                self.send_json({"ok": True, "rollback": result})
                return

            if self.path == "/api/openwrt/cloudflare/status":
                result = openwrt_cloudflare_status(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/openwrt/cloudflare/install":
                result = openwrt_cloudflare_install(
                    self._router_host(payload),
                    str(payload.get("user", "root")),
                    str(payload.get("token", "")),
                )
                self.send_json({"ok": True, "result": result})
                return

            if self.path == "/api/volume/info":
                result = volume_info(str(payload.get("path", "")))
                self.send_json({"ok": True, "volume": result})
                return

            if self.path == "/api/format/usb":
                result = format_usb_disk(str(payload.get("disk_id", "")), str(payload.get("phrase", "")))
                self.send_json({"ok": True, "format": result})
                return

            if self.path == "/api/mtd/parse":
                rows = parse_mtd(str(payload.get("text", "")))
                boot_rows = [row for row in rows if row["risk_hint"] == "bootloader-candidate"]
                self.send_json({"ok": True, "rows": rows, "bootloader_candidates": boot_rows})
                return

            if self.path == "/api/usb/verify":
                raw_path = str(payload.get("path", "")).strip()
                expected_names = [str(name) for name in payload.get("expected_names", []) if str(name).strip()]
                if not raw_path:
                    raise ValueError("USB mount path is required.")
                root = Path(raw_path).expanduser()
                if not root.is_dir():
                    raise ValueError(f"Directory not found: {root}")
                present = {child.name: child for child in root.iterdir() if child.is_file()}
                checks = []
                for name in expected_names:
                    child = present.get(name)
                    checks.append({"name": name, "present": child is not None, "size": child.stat().st_size if child else None})
                extra = sorted(name for name in present if name not in set(expected_names))
                self.send_json({"ok": True, "path": str(root), "checks": checks, "extra_files": extra})
                return

            if self.path == "/api/usb/stage":
                raw_files = payload.get("files", [])
                if not isinstance(raw_files, list):
                    raise ValueError("files must be a list of paths.")
                result = stage_usb_files(
                    str(payload.get("path", "")),
                    [str(item) for item in raw_files if str(item).strip()],
                    overwrite=bool(payload.get("overwrite", False)),
                )
                self.send_json({"ok": True, "stage": result})
                return

            if self.path == "/api/router/probe":
                result = router_probe(str(payload.get("host", "")), str(payload.get("user", "root")))
                self.send_json({"ok": True, "probe": result})
                return

            if self.path == "/api/router/backup":
                result = router_backup(str(payload.get("host", "")), str(payload.get("user", "root")))
                self.send_json({"ok": True, "backup": result})
                return

            if self.path == "/api/export":
                state = payload.get("state")
                if not isinstance(state, dict):
                    raise ValueError("state object is required.")
                SESSIONS_DIR.mkdir(exist_ok=True)
                stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
                out = SESSIONS_DIR / f"mx65-flash-session-{stamp}.md"
                out.write_text(render_export_markdown(state, load_cached_profile()), encoding="utf-8")
                self.send_json({"ok": True, "path": str(out)})
                return

            self.send_error(HTTPStatus.NOT_FOUND)
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, status=400)


def find_free_port(start: int) -> int:
    for port in range(start, start + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"No free port found from {start} to {start + 49}.")


def main() -> int:
    port = find_free_port(DEFAULT_PORT)
    server = ThreadingHTTPServer(("127.0.0.1", port), GuideHandler)
    print("My-Rack-E Dashboard setup is running locally.", flush=True)
    print(f"Open: http://127.0.0.1:{port}", flush=True)
    print("Keep this terminal open. Press Ctrl-C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping My-Rack-E Dashboard setup.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
