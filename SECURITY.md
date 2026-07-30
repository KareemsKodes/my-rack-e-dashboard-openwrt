# Security Policy

My-Rack-E Dashboard manages a firewall appliance. Treat it as security-sensitive software.

## Supported target

The certified target is Cisco Meraki MX65 running OpenWrt `bcm53xx/generic`.

Recognized profiles may appear in the app, but destructive stock-conversion actions are blocked unless the profile is certified.

## Reporting issues

Use a private report for:

- authentication bypass
- command injection
- CSRF bypass
- unsafe router configuration writes
- token or key disclosure
- firmware or bootloader verification failures
- rollback failures

## Secrets

Do not commit:

- generated files under `data/`
- downloaded files under `downloads/`
- `backups/`
- `sessions/`
- router tokens
- SSH private keys
- local CA private keys
- router backups
- firmware images

## Local manager exposure

The router-hosted dashboard is built for trusted LAN access. The firewall baseline blocks manager ports from WAN. Do not expose `/mx65/` directly to the public internet.

For remote access, prefer a Cloudflare Tunnel with Zero Trust access policy.

## MCP exposure

The MCP server is a local stdio bridge for trusted MCP clients. It shells out to the real management CLI and reaches the router over SSH.

Do not expose the MCP server over a network listener. Do not connect it to untrusted agents. Keep mutating tools guarded by their confirmation strings.

## Update trust

Router manager updates must use the trusted update pathway:

- archive SHA-256 verification
- managed-file manifest verification
- backup before replacement
- rollback path retained

Do not copy arbitrary files onto the router outside the update path unless you are actively developing and have a recovery plan.
