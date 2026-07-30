#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import secrets
import shlex
import stat
import subprocess
import sys
import time
from urllib.parse import urlparse
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
APP_PATH = ROOT / "app.py"
TOKEN_DIR = ROOT / "data"


def load_app() -> Any:
    spec = importlib.util.spec_from_file_location("mx65_flash_guide_app", APP_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {APP_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def token_path(host: str) -> Path:
    safe_host = host.replace(":", "_").replace("/", "_")
    return TOKEN_DIR / f"mx65-manager-{safe_host}.token"


def write_private_file(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value.strip() + "\n", encoding="utf-8")
    path.chmod(stat.S_IRUSR | stat.S_IWUSR)


def root_password_path(host: str) -> Path:
    safe_host = host.replace(":", "_").replace("/", "_")
    return TOKEN_DIR / f"mx65-root-password-{safe_host}.txt"


def print_block(title: str, value: Any) -> None:
    print(f"\n== {title} ==")
    if isinstance(value, (dict, list)):
        print(json.dumps(value, indent=2, sort_keys=True))
    else:
        print(value)


def ping_host(host: str) -> bool:
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "1000", host],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=3,
        )
        return result.returncode == 0
    except Exception:
        return False


def summarize_status(status: dict[str, Any]) -> None:
    manifest = status.get("manifest") or {}
    print_block(
        "manager",
        {
            "url": status.get("url") or "",
            "token_present": bool(status.get("token_present")),
            "version": manifest.get("version", "unknown"),
            "managed_files": len(manifest.get("files") or []),
        },
    )
    stdout = str(status.get("stdout") or "")
    if stdout:
        print_block("raw status", stdout)


def cmd_preflight(args: argparse.Namespace) -> int:
    app = load_app()
    print_block("ping", "pass" if ping_host(args.host) else "no ping response")
    release = app.ssh_checked(args.host, args.user, "cat /etc/openwrt_release", timeout=10)
    print_block("openwrt", release["stdout"].strip())
    services = app.ssh_run_script(
        args.host,
        args.user,
        r"""
printf 'dhcp.lan.ignore='
uci -q get dhcp.lan.ignore 2>/dev/null || printf 'missing'
printf '\ndnsmasq='
/etc/init.d/dnsmasq status 2>&1 || true
printf '\nfirewall='
/etc/init.d/firewall status 2>&1 || true
printf '\nfw4='
fw4 check 2>&1 && printf 'ok\n' || true
printf '\nbr-lan=\n'
ip -4 addr show br-lan 2>/dev/null || true
""",
        timeout=20,
    )
    print_block("services", services["stdout"].strip())
    return 0


def cmd_backup(args: argparse.Namespace) -> int:
    app = load_app()
    backup = app.router_backup(args.host, args.user)
    print_block("backup", backup)
    return 0


def cmd_ssh_key(args: argparse.Namespace) -> int:
    app = load_app()
    key = app.ensure_gui_ssh_key()
    print_block(
        "ssh key",
        {
            "private_key": key.get("private_key", ""),
            "public_key": key.get("public_key", ""),
        },
    )
    print_block("run this on the MX", key.get("install_command", ""))
    return 0


def cmd_install(args: argparse.Namespace) -> int:
    app = load_app()
    if not args.skip_preflight:
        cmd_preflight(args)
    if not args.skip_backup:
        backup = app.router_backup(args.host, args.user)
        print_block("backup", backup["path"])
    deploy = app.openwrt_deploy_router_manager(args.host, args.user)
    if deploy.get("token"):
        path = token_path(args.host)
        write_private_file(path, deploy["token"])
        print_block("token saved", str(path))
    print_block(
        "installed",
        {
            "url": deploy.get("url", ""),
            "version": deploy.get("version", ""),
            "archive_sha256": deploy.get("archive_sha256", ""),
            "backup": deploy.get("backup", ""),
            "token": deploy.get("token", ""),
        },
    )
    status = app.openwrt_router_manager_status(args.host, args.user)
    summarize_status(status)
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    app = load_app()
    status = app.openwrt_router_manager_status(args.host, args.user)
    summarize_status(status)
    return 0


def cmd_manager_token(args: argparse.Namespace) -> int:
    app = load_app()
    status = app.openwrt_router_manager_status(args.host, args.user)
    if not bool(status.get("token_present")):
        raise RuntimeError("Manager token file is not present on the MX yet. Run install/update first.")
    token = app.ssh_checked(args.host, args.user, "cat /etc/mx65-manager/token", timeout=10)
    print_block("manager token", token["stdout"].strip())
    status_payload = status.get("status", status)
    url = status.get("url") or status_payload.get("url") or ""
    if url:
        print_block("manager url", url)
    return 0


def cmd_update(args: argparse.Namespace) -> int:
    app = load_app()
    update = app.openwrt_update_router_manager(args.host, args.user)
    if update.get("token"):
        path = token_path(args.host)
        write_private_file(path, update["token"])
        print_block("token saved", str(path))
    print_block(
        "updated",
        {
            "url": update.get("url", ""),
            "version": update.get("version", ""),
            "archive_sha256": update.get("archive_sha256", ""),
            "backup": update.get("backup", ""),
        },
    )
    status = app.openwrt_router_manager_status(args.host, args.user)
    summarize_status(status)
    return 0


def cmd_rollback(args: argparse.Namespace) -> int:
    app = load_app()
    rollback = app.openwrt_rollback_router_manager(args.host, args.user)
    print_block("rollback", rollback)
    status = app.openwrt_router_manager_status(args.host, args.user)
    summarize_status(status)
    return 0


def cmd_activate_basic(args: argparse.Namespace) -> int:
    app = load_app()
    result = app.ssh_run_script(
        args.host,
        args.user,
        r"""
set -u
uci -q set dhcp.lan.ignore='0'
uci -q commit dhcp
/etc/init.d/dnsmasq enable
/etc/init.d/dnsmasq restart
/etc/init.d/firewall enable
/etc/init.d/firewall restart
printf 'dhcp.lan.ignore='
uci -q get dhcp.lan.ignore
printf '\ndnsmasq='
/etc/init.d/dnsmasq status 2>&1 || true
printf '\nfirewall='
/etc/init.d/firewall status 2>&1 || true
""",
        timeout=30,
    )
    print_block("basic services activated", result["stdout"].strip())
    return 0


def public_key_only_ssh(host: str, user: str, key_path: str, command: str) -> str:
    result = subprocess.run(
        [
            "ssh",
            "-i",
            key_path,
            "-o",
            "BatchMode=yes",
            "-o",
            "PreferredAuthentications=publickey",
            "-o",
            "PubkeyAuthentication=yes",
            "-o",
            "PasswordAuthentication=no",
            "-o",
            "KbdInteractiveAuthentication=no",
            "-o",
            "ConnectTimeout=10",
            "-o",
            "StrictHostKeyChecking=accept-new",
            f"{user}@{host}",
            command,
        ],
        capture_output=True,
        text=True,
        timeout=20,
    )
    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout or "public-key SSH failed").strip())
    return result.stdout


def cmd_security_audit(args: argparse.Namespace) -> int:
    app = load_app()
    result = app.ssh_run_script(
        args.host,
        args.user,
        r"""
printf '__ security __\n'
wan_zone="$(uci show firewall 2>/dev/null | sed -n "s/^\(firewall\.@zone\[[0-9][0-9]*\]\)\.name='wan'$/\1/p" | head -1)"
redirect_count="$(uci show firewall 2>/dev/null | sed -n 's/^\(firewall\.[^=]*\)=redirect$/\1/p' | while read -r redirect; do [ "$(uci -q get "$redirect.src" 2>/dev/null)" = "wan" ] && printf 'x\n'; done | wc -l | tr -d ' ')"
root_hash="$(awk -F: '$1=="root"{print $2}' /etc/shadow 2>/dev/null)"
authorized_key_count="$(cat /etc/dropbear/authorized_keys /root/.ssh/authorized_keys 2>/dev/null | sed '/^[[:space:]]*$/d;/^[[:space:]]*#/d' | sort -u | wc -l | tr -d ' ')"
printf 'defaults_input=%s\n' "$(uci -q get firewall.@defaults[0].input 2>/dev/null || printf missing)"
printf 'defaults_forward=%s\n' "$(uci -q get firewall.@defaults[0].forward 2>/dev/null || printf missing)"
printf 'drop_invalid=%s\n' "$(uci -q get firewall.@defaults[0].drop_invalid 2>/dev/null || printf 0)"
printf 'syn_flood=%s\n' "$(uci -q get firewall.@defaults[0].syn_flood 2>/dev/null || printf 0)"
printf 'wan_input=%s\n' "$([ -n "$wan_zone" ] && uci -q get "$wan_zone.input" 2>/dev/null || printf missing)"
printf 'wan_forward=%s\n' "$([ -n "$wan_zone" ] && uci -q get "$wan_zone.forward" 2>/dev/null || printf missing)"
printf 'wan_masq=%s\n' "$([ -n "$wan_zone" ] && uci -q get "$wan_zone.masq" 2>/dev/null || printf missing)"
printf 'manager_wan_block=%s\n' "$(uci -q get firewall.mx65_manager_wan_block.target 2>/dev/null || printf missing)"
printf 'manager_wan_ports=%s\n' "$(uci -q get firewall.mx65_manager_wan_block.dest_port 2>/dev/null || printf missing)"
printf 'redirect_count=%s\n' "$redirect_count"
printf 'force_dns=%s\n' "$([ "$(uci -q get firewall.mx65_force_dns.src 2>/dev/null)" = "lan" ] && [ "$(uci -q get firewall.mx65_force_dns.target 2>/dev/null)" = "DNAT" ] && printf present || printf missing)"
printf 'block_dot=%s\n' "$(uci -q get firewall.mx65_block_dot.target 2>/dev/null || printf missing)"
printf 'ssh_password_auth=%s\n' "$(uci -q get dropbear.main.PasswordAuth 2>/dev/null || printf missing)"
printf 'ssh_root_password_auth=%s\n' "$(uci -q get dropbear.main.RootPasswordAuth 2>/dev/null || printf missing)"
printf 'ssh_interface=%s\n' "$(uci -q get dropbear.main.Interface 2>/dev/null || printf any)"
printf 'ssh_authorized_keys=%s\n' "${authorized_key_count:-0}"
[ -n "$root_hash" ] && [ "$root_hash" != "!" ] && [ "$root_hash" != "*" ] && printf 'root_password=set\n' || printf 'root_password=blank_or_locked\n'
printf 'uhttpd_http=%s\n' "$(uci -q get uhttpd.main.listen_http 2>/dev/null | tr '\n' ' ' || printf missing)"
printf 'uhttpd_https=%s\n' "$(uci -q get uhttpd.main.listen_https 2>/dev/null | tr '\n' ' ' || printf missing)"
printf 'uhttpd_redirect_https=%s\n' "$(uci -q get uhttpd.main.redirect_https 2>/dev/null || printf 0)"
printf 'uhttpd_rfc1918_filter=%s\n' "$(uci -q get uhttpd.main.rfc1918_filter 2>/dev/null || printf missing)"
printf 'dns_localservice=%s\n' "$(uci -q get dhcp.@dnsmasq[0].localservice 2>/dev/null || printf missing)"
printf 'dns_interfaces=%s\n' "$(uci -q get dhcp.@dnsmasq[0].interface 2>/dev/null | tr '\n' ' ' || printf all)"
printf 'dns_rebind_protection=%s\n' "$(uci -q get dhcp.@dnsmasq[0].rebind_protection 2>/dev/null || printf missing)"
printf 'dhcp_wan_ignore=%s\n' "$(uci -q get dhcp.wan.ignore 2>/dev/null || printf missing)"
printf 'upnp_service=%s\n' "$([ -x /etc/init.d/miniupnpd ] && /etc/init.d/miniupnpd enabled >/dev/null 2>&1 && printf enabled || printf absent_or_disabled)"
printf 'wan6_disabled=%s\n' "$(uci -q get network.wan6.disabled 2>/dev/null || printf 0)"
printf 'odhcpd_enabled=%s\n' "$([ -x /etc/init.d/odhcpd ] && /etc/init.d/odhcpd enabled >/dev/null 2>&1 && printf 1 || printf 0)"
printf '\n__ fw4 __\n'
fw4 check 2>&1 || true
printf '\n__ listening __\n'
ss -lntu 2>/dev/null || netstat -lntu 2>/dev/null || true
""",
        timeout=25,
    )
    print_block("security audit", result["stdout"].strip())
    return 0


def cmd_harden_security(args: argparse.Namespace) -> int:
    app = load_app()
    key = app.ensure_gui_ssh_key()
    public_key = key["public_key"]
    private_key = key["private_key"]
    root_password = secrets.token_urlsafe(30)
    password_file = root_password_path(args.host)
    write_private_file(password_file, root_password)
    script = f"""#!/bin/sh
set -u
ts="$(date +%Y%m%d-%H%M%S)"
backup_dir="/etc/mx65-manager/backups"
mkdir -p "$backup_dir" /etc/dropbear /root/.ssh
backup="$backup_dir/security-hardening-$ts.tgz"
items=""
for item in etc/config/firewall etc/config/dropbear etc/config/uhttpd etc/config/dhcp etc/config/network etc/shadow etc/dropbear root/.ssh; do
  [ -e "/$item" ] && items="$items $item"
done
[ -n "$items" ] && (cd / && tar -czf "$backup" $items 2>/tmp/mx65-security-backup.log) || true
chmod 600 "$backup" 2>/dev/null || true

pubkey={shlex.quote(public_key)}
for auth in /etc/dropbear/authorized_keys /root/.ssh/authorized_keys; do
  touch "$auth"
  grep -qxF "$pubkey" "$auth" 2>/dev/null || printf '%s\\n' "$pubkey" >> "$auth"
  chmod 600 "$auth"
done
chmod 700 /root/.ssh /etc/dropbear 2>/dev/null || true

root_password={shlex.quote(root_password)}
root_password_status="not_changed"
if command -v chpasswd >/dev/null 2>&1; then
  printf 'root:%s\\n' "$root_password" | chpasswd && root_password_status="set" || root_password_status="failed"
elif command -v passwd >/dev/null 2>&1; then
  printf '%s\\n%s\\n' "$root_password" "$root_password" | passwd -a sha256 root >/tmp/mx65-passwd.log 2>&1 && root_password_status="set" || root_password_status="failed"
else
  root_password_status="chpasswd_missing"
fi

confirm="/tmp/mx65-hardening-confirmed-$ts"
rollback="/tmp/mx65-security-rollback-$ts.sh"
cat > "$rollback" <<ROLLBACK
#!/bin/sh
sleep 180
[ -f "$confirm" ] && exit 0
tar -xzf "$backup" -C / 2>/tmp/mx65-security-rollback.log || exit 1
/etc/init.d/network reload >/dev/null 2>&1 || true
/etc/init.d/firewall reload >/dev/null 2>&1 || true
/etc/init.d/dnsmasq restart >/dev/null 2>&1 || true
/etc/init.d/odhcpd restart >/dev/null 2>&1 || true
/etc/init.d/uhttpd restart >/dev/null 2>&1 || true
/etc/init.d/dropbear restart >/dev/null 2>&1 || true
ROLLBACK
chmod 700 "$rollback"
nohup sh "$rollback" >/tmp/mx65-security-rollback-$ts.log 2>&1 &

lan_ip="$(uci -q get network.lan.ipaddr 2>/dev/null || printf 192.168.1.1)"

uci set firewall.@defaults[0].input='REJECT'
uci set firewall.@defaults[0].output='ACCEPT'
uci set firewall.@defaults[0].forward='REJECT'
uci set firewall.@defaults[0].syn_flood='1'
uci set firewall.@defaults[0].drop_invalid='1'
lan_zone="$(uci show firewall 2>/dev/null | sed -n "s/^\\(firewall\\.@zone\\[[0-9][0-9]*\\]\\)\\.name='lan'$/\\1/p" | head -1)"
wan_zone="$(uci show firewall 2>/dev/null | sed -n "s/^\\(firewall\\.@zone\\[[0-9][0-9]*\\]\\)\\.name='wan'$/\\1/p" | head -1)"
[ -n "$lan_zone" ] && uci set "$lan_zone.input=ACCEPT" && uci set "$lan_zone.output=ACCEPT" && uci set "$lan_zone.forward=ACCEPT"
[ -n "$wan_zone" ] && uci set "$wan_zone.input=REJECT" && uci set "$wan_zone.output=ACCEPT" && uci set "$wan_zone.forward=DROP" && uci set "$wan_zone.masq=1" && uci set "$wan_zone.mtu_fix=1"
for name in Allow-Ping Allow-IPSec-ESP Allow-ISAKMP; do
  path="$(uci show firewall 2>/dev/null | sed -n "s/^\\(firewall\\.@rule\\[[0-9][0-9]*\\]\\)\\.name='$name'$/\\1/p" | head -1)"
  [ -n "$path" ] && uci set "$path.enabled=0"
done
uci -q delete firewall.mx65_manager_wan_block
uci set firewall.mx65_manager_wan_block='rule'
uci set firewall.mx65_manager_wan_block.name='Block My-Rack-E local manager from WAN'
uci set firewall.mx65_manager_wan_block.src='wan'
uci set firewall.mx65_manager_wan_block.proto='tcp'
uci set firewall.mx65_manager_wan_block.dest_port='22 80 443'
uci set firewall.mx65_manager_wan_block.target='REJECT'
uci -q delete firewall.mx65_force_dns
uci set firewall.mx65_force_dns='redirect'
uci set firewall.mx65_force_dns.name='Force LAN DNS through My-Rack-E'
uci set firewall.mx65_force_dns.src='lan'
uci set firewall.mx65_force_dns.proto='tcp udp'
uci set firewall.mx65_force_dns.src_dport='53'
uci set firewall.mx65_force_dns.dest_port='53'
uci set firewall.mx65_force_dns.target='DNAT'
uci -q delete firewall.mx65_block_dot
uci set firewall.mx65_block_dot='rule'
uci set firewall.mx65_block_dot.name='Block direct DNS-over-TLS from LAN'
uci set firewall.mx65_block_dot.src='lan'
uci set firewall.mx65_block_dot.dest='wan'
uci set firewall.mx65_block_dot.proto='tcp udp'
uci set firewall.mx65_block_dot.dest_port='853'
uci set firewall.mx65_block_dot.target='REJECT'
uci commit firewall

uci set dropbear.main.enable='1'
uci set dropbear.main.PasswordAuth='off'
uci set dropbear.main.RootPasswordAuth='off'
uci set dropbear.main.Interface='lan'
uci set dropbear.main.Port='22'
uci commit dropbear

uci -q set uhttpd.main.home='/www'
uci -q set uhttpd.main.cgi_prefix='/cgi-bin'
uci -q set uhttpd.main.rfc1918_filter='1'
uci -q set uhttpd.main.redirect_https='1'
uci -q delete uhttpd.main.listen_http
uci -q add_list uhttpd.main.listen_http="$lan_ip:80"
uci -q delete uhttpd.main.listen_https
uci -q add_list uhttpd.main.listen_https="$lan_ip:443"
uci -q commit uhttpd

uci -q set dhcp.@dnsmasq[0].localservice='1'
uci -q delete dhcp.@dnsmasq[0].interface
uci -q add_list dhcp.@dnsmasq[0].interface='br-lan'
uci -q add_list dhcp.@dnsmasq[0].interface='lo'
uci -q set dhcp.@dnsmasq[0].rebind_protection='1'
uci -q set dhcp.@dnsmasq[0].domainneeded='1'
uci -q set dhcp.@dnsmasq[0].boguspriv='1'
uci -q set dhcp.wan.ignore='1'
uci -q set dhcp.lan.dhcpv6='disabled'
uci -q set dhcp.lan.ra='disabled'
uci -q delete dhcp.lan.ra_flags
uci -q commit dhcp

uci -q set network.wan6.disabled='1'
uci -q delete network.lan.ip6assign
uci -q commit network

if [ -x /etc/init.d/miniupnpd ]; then
  /etc/init.d/miniupnpd stop >/dev/null 2>&1 || true
  /etc/init.d/miniupnpd disable >/dev/null 2>&1 || true
fi

fw4 check
/etc/init.d/network reload >/dev/null 2>&1 || true
/etc/init.d/firewall reload >/dev/null 2>&1 || true
/etc/init.d/dnsmasq restart >/dev/null 2>&1 || true
/etc/init.d/odhcpd stop >/dev/null 2>&1 || true
/etc/init.d/odhcpd disable >/dev/null 2>&1 || true
/etc/init.d/uhttpd restart >/dev/null 2>&1 || true
/etc/init.d/dropbear restart >/dev/null 2>&1 || true

printf '__MX65_SECURITY_BACKUP__ %s\\n' "$backup"
printf '__MX65_SECURITY_CONFIRM__ %s\\n' "$confirm"
printf '__MX65_ROOT_PASSWORD_STATUS__ %s\\n' "$root_password_status"
printf '__MX65_ROOT_PASSWORD_FILE__ %s\\n' {shlex.quote(str(password_file))}
"""
    print_block("root password saved", str(password_file))
    result = app.ssh_run_script(args.host, args.user, script, timeout=60)
    print_block("hardening applied", result["stdout"].strip())
    time.sleep(4)
    key_check = public_key_only_ssh(args.host, args.user, private_key, "printf public_key_auth_ok")
    print_block("public-key ssh", key_check.strip())
    app.ssh_checked(args.host, args.user, "touch /tmp/mx65-hardening-confirmed-* 2>/dev/null || true", timeout=10)
    cmd_security_audit(args)
    return 0


def read_tunnel_token(args: argparse.Namespace) -> str:
    if args.token:
        return args.token.strip()
    if args.token_file:
        return Path(args.token_file).expanduser().read_text(encoding="utf-8").strip()
    return os.environ.get("MX65_CLOUDFLARE_TOKEN", "").strip()


def cmd_cloudflare_install(args: argparse.Namespace) -> int:
    token = read_tunnel_token(args)
    if not token:
        raise RuntimeError("Provide --token, --token-file, or MX65_CLOUDFLARE_TOKEN.")
    app = load_app()
    result = app.openwrt_cloudflare_install(args.host, args.user, token)
    print_block(
        "cloudflare tunnel",
        {
            "version": result.get("version", ""),
            "asset": result.get("asset", ""),
            "sha256": result.get("sha256", ""),
            "stdout": result.get("stdout", ""),
        },
    )
    return 0


def cmd_cloudflare_repair(args: argparse.Namespace) -> int:
    app = load_app()
    token_result = app.ssh_checked(args.host, args.user, "cat /etc/cloudflared/token", timeout=10)
    token = token_result["stdout"].strip()
    if not token:
        raise RuntimeError("No existing /etc/cloudflared/token found. Run cloudflare-quickstart.sh and paste the token.")
    result = app.openwrt_cloudflare_install(args.host, args.user, token)
    print_block(
        "cloudflare repair",
        {
            "version": result.get("version", ""),
            "asset": result.get("asset", ""),
            "sha256": result.get("sha256", ""),
            "stdout": result.get("stdout", ""),
        },
    )
    return cmd_cloudflare_validate(args)


def cmd_cloudflare_status(args: argparse.Namespace) -> int:
    app = load_app()
    result = app.openwrt_cloudflare_status(args.host, args.user)
    print_block("cloudflare status", result.get("stdout") or result.get("stderr") or "")
    return 0


def cmd_cloudflare_service(args: argparse.Namespace) -> int:
    app = load_app()
    result = app.openwrt_service_action(args.host, args.user, "cloudflared", args.action)
    print_block(f"cloudflared {args.action}", result.get("stdout") or result.get("stderr") or "")
    return 0


def public_url(value: str) -> str:
    value = value.strip()
    if not value:
        return ""
    if "://" not in value:
        value = f"https://{value}"
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise RuntimeError("Cloudflare validation URL must be a hostname or http(s) URL.")
    return value


def validate_public_url(url: str, expect_text: str = "") -> dict[str, Any]:
    if not url:
        return {"checked": False}
    command = ["curl", "-fsSL", "--max-time", "15", "-D", "-", url]
    result = subprocess.run(command, capture_output=True, timeout=20)
    stdout = result.stdout.decode("utf-8", "replace")
    stderr = result.stderr.decode("utf-8", "replace")
    first_line = stdout.splitlines()[0] if stdout.splitlines() else ""
    ok = result.returncode == 0
    if expect_text:
        ok = ok and expect_text in stdout
    return {
        "checked": True,
        "url": url,
        "ok": ok,
        "http": first_line,
        "expect_text_found": bool(expect_text and expect_text in stdout),
        "stderr": stderr.strip(),
    }


def cloudflare_router_validation(app: Any, host: str, user: str) -> dict[str, Any]:
    script = r"""
section() { printf '\n__MX65_SECTION__ %s\n' "$1"; }
section binary
if command -v cloudflared >/dev/null 2>&1; then
  command -v cloudflared
  cloudflared --version 2>&1 || true
else
  printf 'missing\n'
fi
section token
if [ -s /etc/cloudflared/token ]; then
  wc -c /etc/cloudflared/token 2>/dev/null
else
  printf 'missing\n'
fi
section service
if [ -x /etc/init.d/cloudflared ]; then
  /etc/init.d/cloudflared enabled >/dev/null 2>&1 && printf 'enabled\n' || printf 'disabled\n'
  /etc/init.d/cloudflared status 2>&1 || true
else
  printf 'missing\n'
fi
section process
ps w 2>/dev/null | grep '[c]loudflared' | sed 's/--token [^ ]*/--token [redacted]/g' || true
section dns
nslookup region1.v2.argotunnel.com 2>&1 || nslookup cloudflare.com 2>&1 || true
section https
if command -v wget >/dev/null 2>&1; then
  wget -qO- --timeout=10 https://www.cloudflare.com/cdn-cgi/trace 2>&1 | sed -n '1,12p'
elif command -v curl >/dev/null 2>&1; then
  curl -fsSL --max-time 10 https://www.cloudflare.com/cdn-cgi/trace 2>&1 | sed -n '1,12p'
else
  printf 'no wget or curl available\n'
fi
section logs
logread -e cloudflared -l 160 2>/dev/null || true
"""
    result = app.ssh_run_script(host, user, script, timeout=45)
    sections = app.split_sections(result["stdout"])
    logs = sections.get("logs", "")
    service = sections.get("service", "")
    binary = sections.get("binary", "")
    token = sections.get("token", "")
    https = sections.get("https", "")
    dns = sections.get("dns", "")
    checks = [
        {"name": "binary", "ok": "cloudflared" in binary and "missing" not in binary.lower()},
        {"name": "token", "ok": "missing" not in token.lower() and bool(token.strip())},
        {"name": "service enabled", "ok": "enabled" in service.lower()},
        {"name": "service active", "ok": "running" in service.lower() or "active" in service.lower()},
        {"name": "dns", "ok": "address" in dns.lower() and "bad address" not in dns.lower()},
        {"name": "https", "ok": "h=" in https or "colo=" in https or "ip=" in https},
        {"name": "logs no obvious auth error", "ok": "invalid token" not in logs.lower() and "authentication error" not in logs.lower()},
        {"name": "logs connected", "ok": "registered" in logs.lower() or "connection" in logs.lower() or "connected" in logs.lower()},
    ]
    return {"checks": checks, "sections": sections, "stdout": result["stdout"]}


def cmd_cloudflare_validate(args: argparse.Namespace) -> int:
    app = load_app()
    router = cloudflare_router_validation(app, args.host, args.user)
    public = validate_public_url(public_url(getattr(args, "url", "")), getattr(args, "expect_text", ""))
    print_block("cloudflare validation", {"router_checks": router["checks"], "public_url": public})
    print_block("router detail", router["stdout"])
    failed = [check["name"] for check in router["checks"] if not check["ok"]]
    if public.get("checked") and not public.get("ok"):
        failed.append("public URL")
    return 1 if failed else 0


def cmd_cloudflare_quickstart(args: argparse.Namespace) -> int:
    token = read_tunnel_token(args)
    if token:
        cmd_cloudflare_install(args)
        if args.wait_seconds > 0:
            print_block("waiting", f"{args.wait_seconds}s for cloudflared to establish a connection")
            time.sleep(args.wait_seconds)
    else:
        print_block("install skipped", "No token supplied; running validation only.")
    return cmd_cloudflare_validate(args)


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description="My-Rack-E MX65 install/update helper powered by OpenWrt")
    root.add_argument(
        "--host",
        default=os.environ.get("MX65_DEFAULT_HOST", "192.168.1.1"),
        help="MX OpenWrt LAN IP (overridable via --host or MX65_HOST or MX65_DEFAULT_HOST)",
    )
    root.add_argument("--user", default="root", help="SSH user")
    sub = root.add_subparsers(dest="command", required=True)

    sub.add_parser("preflight", help="Check SSH, OpenWrt, LAN, DHCP, and firewall")
    sub.add_parser("backup", help="Write a local OpenWrt backup bundle")
    sub.add_parser("ssh-key", help="Print the command that authorizes this Mac's manager SSH key on the MX")

    install = sub.add_parser("install", help="Backup, deploy, verify, and print token")
    install.add_argument("--skip-preflight", action="store_true")
    install.add_argument("--skip-backup", action="store_true")

    sub.add_parser("status", help="Show installed local manager status")
    sub.add_parser("manager-token", help="Read the local manager auth token from the MX and print the active URL")
    sub.add_parser("update", help="Apply trusted local-manager update")
    sub.add_parser("rollback", help="Restore latest local-manager backup")
    sub.add_parser("activate-basic", help="Enable LAN DHCP/DNS and firewall services")
    sub.add_parser("security-audit", help="Read-only audit of firewall, SSH, web, DNS, IPv6, and UPnP posture")
    sub.add_parser("harden-security", help="Backup and apply MX65 firewall/SSH/web/DNS hardening with rollback guard")

    cf_install = sub.add_parser("cloudflare-install", help="Install/update cloudflared with a Zero Trust tunnel token")
    cf_install.add_argument("--token", default="")
    cf_install.add_argument("--token-file", default="")

    sub.add_parser("cloudflare-repair", help="Reuse the existing router token and reinstall cloudflared")
    sub.add_parser("cloudflare-status", help="Show cloudflared status and logs")
    cf_validate = sub.add_parser("cloudflare-validate", help="Validate cloudflared service, MX egress, logs, and optional public URL")
    cf_validate.add_argument("--url", default="", help="Optional public hostname or URL to test from this Mac")
    cf_validate.add_argument("--expect-text", default="", help="Optional response text that must be present at --url")

    cf_quickstart = sub.add_parser("cloudflare-quickstart", help="Install cloudflared when a token is supplied, then validate it")
    cf_quickstart.add_argument("--token", default="")
    cf_quickstart.add_argument("--token-file", default="")
    cf_quickstart.add_argument("--url", default="", help="Optional public hostname or URL to test from this Mac")
    cf_quickstart.add_argument("--expect-text", default="", help="Optional response text that must be present at --url")
    cf_quickstart.add_argument("--wait-seconds", type=int, default=8, help="Seconds to wait after install before validation")

    cf_service = sub.add_parser("cloudflare-service", help="Control cloudflared service")
    cf_service.add_argument("action", choices=["start", "stop", "restart", "enable", "disable", "status"])
    return root


def main() -> int:
    args = parser().parse_args()
    commands = {
        "preflight": cmd_preflight,
        "backup": cmd_backup,
        "ssh-key": cmd_ssh_key,
        "install": cmd_install,
        "status": cmd_status,
        "manager-token": cmd_manager_token,
        "update": cmd_update,
        "rollback": cmd_rollback,
        "activate-basic": cmd_activate_basic,
        "security-audit": cmd_security_audit,
        "harden-security": cmd_harden_security,
        "cloudflare-install": cmd_cloudflare_install,
        "cloudflare-repair": cmd_cloudflare_repair,
        "cloudflare-status": cmd_cloudflare_status,
        "cloudflare-validate": cmd_cloudflare_validate,
        "cloudflare-quickstart": cmd_cloudflare_quickstart,
        "cloudflare-service": cmd_cloudflare_service,
    }
    try:
        return commands[args.command](args)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
