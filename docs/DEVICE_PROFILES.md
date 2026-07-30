# Device Profiles

Device profiles keep hardware-specific behavior out of the generic setup flow.

Profiles live in:

```text
device-profiles/
```

Each profile describes:

- project ID
- vendor/model label
- OpenWrt target
- OpenWrt profile ID
- certification status
- default addressing policy
- stock-conversion support
- port map
- notes and limitations

## Current profiles

| Profile | Status | Meaning |
| --- | --- | --- |
| `meraki_mx65` | `certified` | Tested with the setup app, router dashboard, update path, and MX65 stock-conversion USB workflow |
| `meraki_mx64` | `recognized` | Official OpenWrt sysupgrade metadata exists, but stock conversion is blocked until tested |
| `meraki_mx64-a0` | `recognized` | Official OpenWrt sysupgrade metadata exists, but stock conversion is blocked until tested |

## Why recognized devices are blocked

An OpenWrt sysupgrade image means OpenWrt has build support for a device. It does not prove that this setup app has a safe stock-appliance bootloader conversion path for that device.

Before enabling stock USB conversion for a new model, verify:

1. Official OpenWrt profile ID.
2. Exact device revision.
3. Recovery/diagnostic entry method.
4. Bootloader partition name and size.
5. Correct bootloader file and hash.
6. Initramfs boot path.
7. Sysupgrade image name and hash.
8. Physical port map.
9. VLAN behavior.
10. Rollback or serial recovery plan.

Set:

```json
"conversion": {
  "stock_usb": {
    "supported": true
  }
}
```

only after those checks pass.

## Adding another MX model

1. Add a JSON file under `device-profiles/`.
2. Use the OpenWrt profile ID as the `id`, for example `meraki_mx100`.
3. Set `status` to `recognized` first.
4. Add OpenWrt metadata URLs.
5. Add the physical port map only after verifying OpenWrt interface names.
6. Keep `conversion.stock_usb.supported` false until the conversion path is tested.
7. Run the app and confirm the profile appears in the selector.
8. Verify `/api/device-profiles/live` against official OpenWrt release metadata.
9. Add docs and screenshots if behavior differs from MX65.

## Example profile shell

```json
{
  "id": "meraki_mx_example",
  "vendor": "Cisco Meraki",
  "model": "MX Example",
  "display_name": "Cisco Meraki MX Example",
  "status": "recognized",
  "openwrt_target": "bcm53xx/generic",
  "openwrt_profile": "meraki_mx_example",
  "conversion": {
    "stock_usb": {
      "supported": false,
      "blocked_reason": "Conversion metadata has not been tested for this model."
    }
  },
  "ports": []
}
```

## Dashboard behavior on other models

The router dashboard discovers `wan*` and `lan*` interfaces from OpenWrt at runtime. MX65 keeps the certified port ordering, while other models can show their actual OpenWrt port names after live data loads.

VLAN and port actions validate against live `/sys/class/net` interfaces, so a profile cannot enable actions for ports that do not exist on the running appliance.
