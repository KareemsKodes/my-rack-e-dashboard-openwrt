#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CTL = ROOT / "scripts" / "mx65ctl.py"
VERSION = "2026.07.19.1"
MAX_OUTPUT = 12000
DEFAULT_TIMEOUT = 45


READ_TOOLS = {
    "myracke_preflight": {
        "command": "preflight",
        "description": "Check SSH, OpenWrt release, LAN, DHCP/DNS, firewall, and br-lan status.",
        "timeout": 60,
    },
    "myracke_manager_status": {
        "command": "status",
        "description": "Read installed local My-Rack-E dashboard status and manifest verification data.",
        "timeout": 45,
    },
    "myracke_security_audit": {
        "command": "security-audit",
        "description": "Run a read-only firewall, SSH, web, DNS, IPv6, and UPnP posture audit.",
        "timeout": 60,
    },
    "myracke_cloudflare_status": {
        "command": "cloudflare-status",
        "description": "Read cloudflared service status and recent router logs.",
        "timeout": 45,
    },
}

WRITE_TOOLS = {
    "myracke_backup": {
        "command": "backup",
        "description": "Create a local OpenWrt backup bundle through SSH.",
        "confirm": "BACKUP",
        "timeout": 90,
    },
    "myracke_update_manager": {
        "command": "update",
        "description": "Apply the trusted My-Rack-E router-manager update package.",
        "confirm": "UPDATE",
        "timeout": 90,
    },
    "myracke_harden_security": {
        "command": "harden-security",
        "description": "Apply guarded firewall/SSH/web/DNS hardening after making a router backup.",
        "confirm": "HARDEN",
        "timeout": 90,
    },
}


def valid_host(value: str) -> str:
    value = (value or os.environ.get("MX65_HOST") or os.environ.get("MX65_DEFAULT_HOST") or "192.168.1.1").strip()
    if not re.fullmatch(r"[A-Za-z0-9_.:-]{1,255}", value):
        raise ValueError("host must be an IP address or plain hostname")
    return value


def valid_user(value: str) -> str:
    value = (value or os.environ.get("MX65_USER") or "root").strip()
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,64}", value):
        raise ValueError("user contains unsupported characters")
    return value


def text(value: str) -> dict[str, str]:
    return {"type": "text", "text": value}


def tool_schema(write: bool = False, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    properties: dict[str, Any] = {
        "host": {
            "type": "string",
            "description": "OpenWrt router IP or hostname. Defaults to MX65_HOST, then MX65_DEFAULT_HOST, then 192.168.1.1.",
        },
        "user": {
            "type": "string",
            "description": "SSH user. Defaults to MX65_USER or root.",
        },
    }
    required: list[str] = []
    if write:
        properties["confirm"] = {
            "type": "string",
            "description": "Required exact confirmation word shown in this tool description.",
        }
        required.append("confirm")
    if extra:
        properties.update(extra)
    return {
        "type": "object",
        "properties": properties,
        "additionalProperties": False,
        "required": required,
    }


def tools() -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for name, spec in READ_TOOLS.items():
        out.append(
            {
                "name": name,
                "description": spec["description"],
                "inputSchema": tool_schema(),
            }
        )
    out.append(
        {
            "name": "myracke_cloudflare_validate",
            "description": "Validate cloudflared service, MX egress, logs, and optionally a public URL.",
            "inputSchema": tool_schema(
                extra={
                    "url": {"type": "string", "description": "Optional public hostname or URL to test."},
                    "expect_text": {"type": "string", "description": "Optional response text expected at url."},
                }
            ),
        }
    )
    for name, spec in WRITE_TOOLS.items():
        out.append(
            {
                "name": name,
                "description": f"{spec['description']} Requires confirm={spec['confirm']}.",
                "inputSchema": tool_schema(write=True),
            }
        )
    return out


def run_ctl(command: str, args: dict[str, Any], timeout: int = DEFAULT_TIMEOUT) -> dict[str, Any]:
    host = valid_host(str(args.get("host") or ""))
    user = valid_user(str(args.get("user") or ""))
    cmd = [sys.executable, str(CTL), "--host", host, "--user", user, command]
    if command == "cloudflare-validate":
        url = str(args.get("url") or "").strip()
        expect_text = str(args.get("expect_text") or "").strip()
        if url:
            cmd.extend(["--url", url])
        if expect_text:
            cmd.extend(["--expect-text", expect_text])
    result = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True, timeout=timeout)
    stdout = result.stdout[-MAX_OUTPUT:]
    stderr = result.stderr[-4000:]
    payload = {
        "command": " ".join(cmd),
        "returncode": result.returncode,
        "stdout": stdout,
        "stderr": stderr,
    }
    return payload


def call_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    if name in READ_TOOLS:
        spec = READ_TOOLS[name]
        result = run_ctl(spec["command"], args, timeout=int(spec.get("timeout", DEFAULT_TIMEOUT)))
        return {"content": [text(json.dumps(result, indent=2))], "isError": result["returncode"] != 0}
    if name == "myracke_cloudflare_validate":
        result = run_ctl("cloudflare-validate", args, timeout=90)
        return {"content": [text(json.dumps(result, indent=2))], "isError": result["returncode"] != 0}
    if name in WRITE_TOOLS:
        spec = WRITE_TOOLS[name]
        if str(args.get("confirm") or "") != spec["confirm"]:
            raise ValueError(f"{name} requires confirm={spec['confirm']}")
        result = run_ctl(spec["command"], args, timeout=int(spec.get("timeout", DEFAULT_TIMEOUT)))
        return {"content": [text(json.dumps(result, indent=2))], "isError": result["returncode"] != 0}
    raise ValueError(f"Unknown tool: {name}")


def read_message() -> dict[str, Any] | None:
    headers: dict[str, str] = {}
    while True:
        line = sys.stdin.buffer.readline()
        if not line:
            return None
        if line in {b"\r\n", b"\n"}:
            break
        raw = line.decode("ascii", "replace").strip()
        if ":" in raw:
            key, value = raw.split(":", 1)
            headers[key.lower()] = value.strip()
        elif raw.startswith("{"):
            return json.loads(raw)
    length = int(headers.get("content-length", "0"))
    if length <= 0:
        return None
    body = sys.stdin.buffer.read(length)
    return json.loads(body.decode("utf-8"))


def send_message(message: dict[str, Any]) -> None:
    body = json.dumps(message, separators=(",", ":")).encode("utf-8")
    sys.stdout.buffer.write(f"Content-Length: {len(body)}\r\n\r\n".encode("ascii"))
    sys.stdout.buffer.write(body)
    sys.stdout.buffer.flush()


def result_response(message_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": message_id, "result": result}


def error_response(message_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": message_id, "error": {"code": code, "message": message}}


def handle(message: dict[str, Any]) -> dict[str, Any] | None:
    method = message.get("method")
    message_id = message.get("id")
    params = message.get("params") or {}
    try:
        if method == "initialize":
            return result_response(
                message_id,
                {
                    "protocolVersion": params.get("protocolVersion", "2024-11-05"),
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "myracke-mcp", "version": VERSION},
                },
            )
        if method == "notifications/initialized":
            return None
        if method == "tools/list":
            return result_response(message_id, {"tools": tools()})
        if method == "tools/call":
            name = str(params.get("name") or "")
            arguments = params.get("arguments") or {}
            if not isinstance(arguments, dict):
                raise ValueError("arguments must be an object")
            return result_response(message_id, call_tool(name, arguments))
        if message_id is None:
            return None
        return error_response(message_id, -32601, f"Method not found: {method}")
    except Exception as exc:
        return error_response(message_id, -32000, str(exc))


def main() -> int:
    while True:
        message = read_message()
        if message is None:
            return 0
        response = handle(message)
        if response is not None:
            send_message(response)


if __name__ == "__main__":
    raise SystemExit(main())
