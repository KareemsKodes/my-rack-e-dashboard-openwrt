# Wi-Fi Support Reality

Short version: treat MX64W/MX65W Wi-Fi as unsupported for this project.

## What OpenWrt reports

OpenWrt's device information for Meraki MX65W lists wireless as unsupported. The MX64/MX64W documentation notes Broadcom BCM43520KMLG wireless chips and says wireless is not supported because Broadcom Wi-Fi has limited free/open-source driver availability.

## Is it hardware-locked or just code?

It is mostly a driver/firmware support problem, not a simple dashboard setting.

The wireless hardware exists on MX64W/MX65W boards, but useful OpenWrt support requires working kernel driver support, firmware loading, regulatory behavior, calibration/NVRAM handling, and integration with OpenWrt wireless configuration. For these Broadcom chips, the missing part is not just a UI toggle.

## Development Scope

Functional support is a serious hardware-driver project.

Required work includes:

- exact chip and bus identification from the board
- boot logs and PCIe/device-tree evidence
- compatible Broadcom driver path
- redistributable firmware or legal instructions for users to provide their own firmware
- board-specific calibration/NVRAM data
- regulatory compliance handling
- OpenWrt packaging and testing

If the only functional firmware is tied to Cisco/Meraki's proprietary system, the work becomes legally and technically difficult. Do not treat this as a codebreaking task, and do not ship extracted Cisco firmware.

## Recommended approach

Use the MX as a wired firewall and attach a separate supported OpenWrt access point or commercial AP for Wi-Fi.

Good lab pattern:

```text
Internet/modem -> My-Rack-E MX firewall -> managed switch -> access point
```

That gives stable routing, VLANs, firewalling, DHCP, Cloudflare Tunnel, and clean Wi-Fi support without depending on unsupported Broadcom wireless.

## References

- OpenWrt MX65W techdata: https://openwrt.org/toh/hwdata/meraki/meraki_mx65w
- OpenWrt MX64/MX64W page: https://openwrt.org/toh/meraki/mx64
