# System Architecture

My-Rack-E Dashboard has two parts: a local setup app that runs on macOS and a dashboard bundle that runs on the OpenWrt appliance.

## Components

| Component | Path | Runs on | Function |
| --- | --- | --- | --- |
| Setup app | `app.py` | macOS | Local HTTP app, USB formatting, bundle download, router install/update helpers |
| Setup UI | `static/` | macOS browser | Conversion USB wizard and setup console |
| Router dashboard | `router-manager/www/mx65/` | OpenWrt `uhttpd` | Local My-Rack-E management UI |
| Router API | `router-manager/www/cgi-bin/mx65-api` | OpenWrt shell CGI | Token-gated actions against UCI, services, logs, ports, firewall, DHCP |
| Device profiles | `device-profiles/` | macOS app and docs | Supported device metadata and destructive-action guardrails |
| Scripts | `scripts/` | macOS | Repeatable install, update, status, Cloudflare, certificate, rollback workflows |
| MCP bridge | `mcp/myracke_mcp.py` | Local MCP client host | Agent-assisted read-only checks and guarded management actions |

## Local setup app

`app.py` serves only on `127.0.0.1`. It generates a per-session token and requires that token for local API calls. It can:

- download OpenWrt metadata and images from official OpenWrt hosts
- download and verify MX65 stock-conversion files
- list removable macOS USB disks
- erase a selected removable USB disk as FAT32/MBR
- copy and hash-verify USB files
- build the router manager update archive
- install or update the manager over root SSH
- back up router state before changes

The app refuses stock-conversion USB creation for device profiles that are not marked `conversion.stock_usb.supported: true`.

## Router dashboard

The dashboard is a static HTML/CSS/JS app served from:

```text
/www/mx65/
```

It talks to:

```text
/www/cgi-bin/mx65-api
```

The CGI script reads live OpenWrt state and performs guarded mutations. The UI hides UCI syntax and presents settings in user-facing sections:

- Appliance status
- Clients
- Route table
- Event log
- Tools
- Addressing & VLANs
- DHCP
- Firewall
- Port forwarding & NAT
- SD-WAN & traffic shaping
- Site-to-site VPN / Cloudflare connector
- Ports
- Firmware & updates

## Authentication model

The install script creates `/etc/mx65-manager/token`. The browser can either send the token directly once or save a local same-site session cookie. Mutating API calls also require the CSRF token cookie/header pair.

The router manager is designed for LAN use. Firewall hardening blocks local manager ports from WAN.

## MCP model

The MCP server runs locally over stdio. It wraps `scripts/mx65ctl.py` and reaches the router over SSH. Read-only operations are exposed directly. Backup, trusted update, and hardening tools require exact confirmation words.

Keep the MCP server off TCP listeners and Cloudflare Tunnels.

## Trusted update pathway

The update flow is simple and inspectable:

1. Build archive from `router-manager/`.
2. Generate `manifest.json` with managed files, modes, sizes, hashes, version, and trust notes.
3. Generate `manifest.sha256`.
4. Upload archive to the router over SSH.
5. Verify archive SHA-256 on the router before extraction.
6. Extract into a staging directory.
7. Verify each staged file against `manifest.sha256`.
8. Back up the existing manager bundle.
9. Copy staged files into place.
10. Restart `uhttpd`.

Rollback uses the previous `/etc/mx65-manager/backups/*.tgz` archive.

## Configuration changes

Dashboard and scripts use OpenWrt UCI commands, then validate before reload where possible:

- Network changes: `uci set network...`, `uci commit network`
- DHCP changes: `uci set dhcp...`, `uci commit dhcp`
- Firewall changes: `uci set firewall...`, `fw4 check`, `uci commit firewall`
- Service reloads: `/etc/init.d/network`, `/etc/init.d/dnsmasq`, `/etc/init.d/firewall`, `/etc/init.d/uhttpd`

Addressing helpers use Cisco-style logic for common home-lab subnetting: when a subnet such as `10.69.69.0/24` is entered, the gateway is the first usable address, `10.69.69.1`, and DHCP is placed in a client range with low addresses reserved for infrastructure.

## Data that must not be committed

Runtime folders can contain secrets or large binaries:

- `data/`
- `downloads/`
- `backups/`
- `sessions/`

The public package includes only source, docs, profiles, and preview images.
