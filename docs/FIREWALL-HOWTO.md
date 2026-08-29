# MX Firewall How-To

This guide starts after OpenWrt and the My-Rack-E dashboard are installed.

## First checks

Open the dashboard and click `Check`.

Confirm:

- LAN has an IPv4 gateway.
- DHCP/DNS is running.
- Firewall is running.
- WAN is either connected or intentionally unplugged.
- Manager token is present.
- WAN access to the manager is blocked.

From the Mac:

```sh
./scripts/check-status.sh
```

## LAN addressing

The dashboard accepts either a gateway address or a subnet.

Examples:

- `192.168.1.1`
- `192.168.1.0/24`
- `10.10.10.0/24`

For a subnet input, My-Rack-E uses the first usable address as the gateway:

```text
10.10.10.0/24 -> gateway 10.10.10.1
```

The default DHCP pattern reserves low addresses for infrastructure and uses a client pool later in the subnet. That keeps room for router, switches, servers, hypervisors, printers, and fixed lab hosts.

## VLANs

Use `Configure > Addressing & VLANs`.

1. Enter VLAN ID.
2. Add a name.
3. Enter gateway or subnet.
4. Let the auto-DHCP helper calculate the pool.
5. Select LAN ports.
6. Save.

The dashboard writes OpenWrt bridge VLANs and DHCP sections. It validates the generated DHCP pool and firewall syntax before applying changes.

## Port management

Use `Appliance > Ports`.

The port page shows:

- Internet/LAN role.
- Link state.
- Activity since refresh.
- Total RX/TX.
- Error counters.
- Client count when bridge forwarding data is available.
- Local label and purpose.
- Access/trunk VLAN mode.

Disabling an active port is guarded. The API refuses to disable the only active LAN port.

## DHCP clients and reservations

Use `Monitor > Clients` for observed devices and `Configure > DHCP` for reservations.

For each device, you can record:

- friendly name
- MAC address
- IP address
- model
- serial number
- role
- expected addressing mode

The dashboard flags common mismatches, such as a device expected to be reserved but currently using an ordinary dynamic lease.

## Firewall baseline

Use `Configure > Firewall`.

Recommended baseline:

- Default LAN-to-WAN allowed.
- WAN-to-LAN denied except explicit forwards.
- Router manager blocked from WAN.
- DNS forced through the MX for LAN clients when desired.
- SSH reachable from LAN only.
- UPnP disabled unless there is a specific lab reason.
- Firewall syntax checked with `fw4 check`.

The hardening script:

```sh
python3 scripts/mx65ctl.py --host 10.10.10.1 harden-security
```

backs up current UCI config, applies baseline rules, validates, and leaves rollback data.

## Port forwarding and NAT

Use `Configure > Port forwarding & NAT`.

For internet-exposed services:

1. Name the rule clearly.
2. Pick protocol.
3. Set public port or range.
4. Set LAN IP.
5. Set local port.
6. Restrict allowed source IPs when possible.
7. Save and verify with `fw4 check`.

Prefer Cloudflare Tunnel for web apps that do not need direct inbound WAN exposure.

## Cloudflare Tunnel

Use the dashboard `Site-to-site VPN` page or:

```sh
./scripts/cloudflare-quickstart.sh
```

The quickstart script prompts for a token, installs `cloudflared`, writes the service file, enables the service, and validates status. Use Cloudflare Zero Trust to map public hostnames to internal services.

## Updates

Use `Appliance > Firmware & updates` or:

```sh
./scripts/apply-trusted-update.sh
```

Before updating:

- Make a router backup.
- Keep the previous dashboard token.
- Verify LAN access.
- Do not update while changing LAN/VLAN addressing.

After updating:

- Refresh the dashboard.
- Run `Check`.
- Confirm manager manifest verification is `OK`.

## Backups and rollback

Create a backup before major changes:

```sh
python3 scripts/mx65ctl.py --host 10.10.10.1 backup
```

Rollback the manager:

```sh
./scripts/rollback-manager.sh
```

For network mistakes, use the latest UCI backup under `/etc/mx65-manager/backups/`.
