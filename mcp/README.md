# My-Rack-E MCP Server

`myracke_mcp.py` exposes the existing My-Rack-E management CLI as a local MCP stdio server.

It is intentionally small and dependency-free. Read-only tools run directly. Mutating tools require exact confirmation words.

## Tools

Read-only:

- `myracke_preflight`
- `myracke_manager_status`
- `myracke_security_audit`
- `myracke_cloudflare_status`
- `myracke_cloudflare_validate`

Guarded:

- `myracke_backup` with `confirm: "BACKUP"`
- `myracke_update_manager` with `confirm: "UPDATE"`
- `myracke_harden_security` with `confirm: "HARDEN"`

## Example MCP client configuration

Use the absolute path for your checkout:

```json
{
  "mcpServers": {
    "myracke": {
      "command": "python3",
      "args": ["/absolute/path/to/my-rack-e-dashboard/mcp/myracke_mcp.py"],
      "env": {
        "MX65_HOST": "10.10.10.1",
        "MX65_USER": "root"
      }
    }
  }
}
```

For TOML-based MCP clients:

```toml
[mcp_servers.myracke]
command = "python3"
args = ["/absolute/path/to/my-rack-e-dashboard/mcp/myracke_mcp.py"]

[mcp_servers.myracke.env]
MX65_HOST = "10.10.10.1"
MX65_USER = "root"
```

Keep this MCP server local. It shells out to `scripts/mx65ctl.py`, which reaches the router over SSH.
