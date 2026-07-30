# My-Rack-E Dashboard Setup Guide

This guide covers the certified Cisco Meraki MX65 path: create the USB on macOS, convert the stock appliance to OpenWrt, install the local My-Rack-E dashboard, and verify the firewall is ready for lab use.

## Requirements

- macOS computer. The USB formatting workflow uses macOS `diskutil`.
- Ethernet adapter/cable.
- USB flash drive that can be erased.
- Cisco Meraki MX65 or MX65-HW in stock/out-of-support state.
- No active connection from the MX65 to your home network during conversion.

## Default Values

| Item | Default |
| --- | --- |
| Setup machine | macOS |
| Setup app URL | `http://127.0.0.1:8787` unless that port is busy |
| USB label | `MX65FLASH` |
| USB format | FAT32 partition on MBR/DOS partition map |
| Stock recovery router IP | `192.168.1.1` |
| Direct laptop IP | `192.168.1.2/24` |
| Root SSH user after OpenWrt boots | `root` |
| Dashboard URL on default LAN | `http://192.168.1.1/mx65/` |
| Optional lab LAN | `10.69.69.0/24` |
| Optional lab gateway | `10.69.69.1` |
| DHCP helper policy | first usable IP is the gateway; low addresses are reserved for infrastructure; the client pool starts later in the subnet |

## 1. Start the setup app

From this project folder:

```sh
python3 app.py
```

Open the printed `http://127.0.0.1:PORT` URL.

## 2. Create the conversion USB

1. Select `Cisco Meraki MX65`.
2. Click `Download Conversion Bundle`.
3. Insert the USB drive.
4. Click `Find USB Disks`.
5. Pick the external physical disk, for example `disk4`.
6. Type exactly:

   ```text
   ERASE MX65FLASH
   ```

7. Click `Erase + Format USB`.
8. Click `Copy Bundle To USB`.
9. Click `Verify USB`.

After a successful copy, the USB contains:

- `uboot_mx65`
- `uboot_mx65_small`
- OpenWrt MX65 initramfs image
- OpenWrt MX65 sysupgrade image
- `READ_ME_FIRST_MX65.txt`

## 3. Convert the stock MX65

Use the read-me generated onto the USB as the device-side source of truth. The conversion sequence is:

1. Work offline.
2. Connect one computer directly to an MX65 LAN port.
3. Set the computer Ethernet address to `192.168.1.2/24`.
4. Put the MX65 into its diagnostic/recovery state.
5. Verify `ping 192.168.1.1`.
6. Inspect `/proc/mtd`.
7. Select `uboot_mx65` or `uboot_mx65_small` based on the bootloader partition size.
8. Write only the selected U-Boot file.
9. Reboot with the USB inserted so OpenWrt initramfs starts.
10. Copy the sysupgrade image to `/tmp`.
11. Run `sysupgrade`.

Run the bootloader write only when the device profile and `/proc/mtd` evidence match the instructions.

### Diagnostic LED note

Do not rely only on the front status LED. On one tested MX65-HW, diagnostic/recovery access did not show a clear status-light transition. Use Ethernet link, ping reachability, and diagnostic shell access as the practical confirmation.

## 4. Install the dashboard after OpenWrt boots

When OpenWrt responds on the LAN:

```sh
./scripts/install-and-activate.sh
```

The script runs:

- ping check
- OpenWrt release check
- DHCP/DNS/firewall service check
- backup collection
- manager package build
- manifest verification
- router install
- token generation

It prints the local dashboard URL and saves the token under `data/`.

## 5. Open My-Rack-E Dashboard

Open:

```text
http://192.168.1.1/mx65/
```

Paste the manager token and click `Save`, then `Check`.

If you changed the LAN to `10.69.69.0/24`, open:

```text
https://10.69.69.1/mx65/
```

If you ever lose the cached browser token after restart:

```sh
./scripts/show-manager-token.sh
```

Paste the reported token in the dashboard, then click `Save` and `Check`.

## 6. Enable trusted HTTPS

After the dashboard works over HTTP:

```sh
./scripts/trust-mx65-https.sh 10.69.69.1
```

This creates a constrained local CA, trusts it in the macOS login keychain, installs a router certificate, and enables HTTPS redirect for the local manager.

## 7. Apply firewall hardening

Use the dashboard `Firewall` page or:

```sh
python3 scripts/mx65ctl.py --host 10.69.69.1 harden-security
```

The hardening path backs up configuration first, validates firewall syntax, reloads services, and keeps rollback data.

## 8. Optional Cloudflare Tunnel

Create a Cloudflare `cloudflared` tunnel token in Zero Trust, then run:

```sh
./scripts/cloudflare-quickstart.sh
```

The script prompts for the token without echoing it to the terminal.

## 9. Optional MCP management bridge

For local agent-assisted management, configure the MCP server:

```text
mcp/myracke_mcp.py
```

See [MCP.md](MCP.md). Keep the MCP server local and prefer read-only tools unless you have a current backup.

## Recovery

- Router manager rollback: `./scripts/rollback-manager.sh`
- Cloudflare repair: `./scripts/cloudflare-repair.sh`
- Config backup folders: `backups/`
- Router manager backups: `/etc/mx65-manager/backups/`

Keep the first known-good OpenWrt backup before changing VLANs, LAN addressing, or firewall policy.
