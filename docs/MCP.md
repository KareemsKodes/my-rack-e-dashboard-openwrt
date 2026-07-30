# MCP Management Server

My-Rack-E includes a local MCP stdio server at:

```text
mcp/myracke_mcp.py
```

The MCP server wraps the real management CLI in `scripts/mx65ctl.py`. It does not replace the dashboard. It gives compatible MCP clients a safe way to inspect and, with explicit confirmation, operate the OpenWrt appliance.

## Why MCP exists

The dashboard is for normal human use. MCP is for local automation and agent-assisted operations such as:

- checking whether the router is reachable
- reading manager status
- running the firewall/security audit
- checking Cloudflare Tunnel status
- creating a backup before a change
- applying a trusted manager update

## Available tools

Read-only tools:

- `myracke_preflight`
- `myracke_manager_status`
- `myracke_security_audit`
- `myracke_cloudflare_status`
- `myracke_cloudflare_validate`

Guarded tools:

- `myracke_backup`, requires `confirm: "BACKUP"`
- `myracke_update_manager`, requires `confirm: "UPDATE"`
- `myracke_harden_security`, requires `confirm: "HARDEN"`

The guarded tools still use the existing backup, manifest, validation, and rollback logic.

## MCP client setup

Use the absolute path to your checkout.

JSON-style MCP config:

```json
{
  "mcpServers": {
    "myracke": {
      "command": "python3",
      "args": ["/absolute/path/to/my-rack-e-dashboard/mcp/myracke_mcp.py"],
      "env": {
        "MX65_HOST": "10.69.69.1",
        "MX65_USER": "root"
      }
    }
  }
}
```

TOML-style MCP config:

```toml
[mcp_servers.myracke]
command = "python3"
args = ["/absolute/path/to/my-rack-e-dashboard/mcp/myracke_mcp.py"]

[mcp_servers.myracke.env]
MX65_HOST = "10.69.69.1"
MX65_USER = "root"
```

## Manual smoke test

This verifies the server can initialize and list tools:

```sh
python3 mcp/myracke_mcp.py
```

MCP clients speak framed JSON-RPC over stdio, so normal terminal output is not expected until a client connects.

## Security notes

- Keep the MCP server local.
- Do not expose it over a network socket.
- Do not pass Cloudflare tunnel tokens through MCP.
- Prefer read-only tools unless a backup exists and you have console recovery access.
