# MX65 Flashing Notes

The setup app prepares the conversion USB. The bootloader write remains a deliberate device-side operation.

## Certified path

The certified stock conversion path is for Cisco Meraki MX65 only.

Use MX65 bootloader files only on a matching MX65 profile and matching `/proc/mtd` layout. Other MX models need tested device profiles before stock-conversion automation is enabled.

## USB creation

Use the setup app:

```sh
python3 app.py
```

Then:

1. Select `Cisco Meraki MX65`.
2. Download the conversion bundle.
3. Format the USB as FAT32/MBR with label `MX65FLASH`.
4. Copy and verify the files.
5. Read `READ_ME_FIRST_MX65.txt` on the USB.

## Defaults used during flashing

| Item | Default |
| --- | --- |
| Setup machine | macOS |
| USB label / format | `MX65FLASH`, FAT32, MBR |
| Stock recovery router IP | `192.168.1.1` |
| Direct laptop IP | `192.168.1.2/24` |
| SSH user after OpenWrt boots | `root` |
| Dashboard URL after install | `http://192.168.1.1/mx65/` |

## Offline flashing environment

Keep the router isolated:

- no uplink
- no home network switch
- no internet connection on the MX
- one directly connected computer
- computer Ethernet set to `192.168.1.2/24`

Stock recovery/diagnostic work uses:

```text
192.168.1.1
```

## Diagnostic mode indication

Do not rely only on the front status LED.

On one tested MX65-HW unit, diagnostic/recovery access did not present a clear status-light transition. The status light did not reliably change into an obvious flashing diagnostic pattern. Link lights and ping reachability were more useful indicators.

Use these checks instead:

```sh
ping 192.168.1.1
```

Then open the diagnostic shell required by the conversion instructions.

## Bootloader selection

Before writing U-Boot, inspect `/proc/mtd`.

Use:

- `uboot_mx65` when the bootloader partition size matches the normal MX65 layout.
- `uboot_mx65_small` only when the bootloader partition size matches the small layout described in the USB read-me.

If `/proc/mtd` does not match the read-me, stop.

## Permanent install

After the bootloader change, boot OpenWrt initramfs from USB, copy the sysupgrade image to `/tmp`, and run `sysupgrade`.

After the permanent install:

1. Set the root password.
2. Confirm `/etc/openwrt_release`.
3. Confirm `/proc/mtd`.
4. Confirm `br-lan` has an IPv4 address.
5. Run `./scripts/install-and-activate.sh` from the Mac.

## What to do immediately after OpenWrt boots

After the router reboots into OpenWrt, remove the USB for normal operation and finish the management install before changing routing, VLANs, DHCP, or firewall policy.

1. Keep the laptop directly cabled to any LAN port.
2. Confirm static host addressing still matches the active LAN subnet:

   ```text
   192.168.1.x/24
   ```

   (or the subnet you configured during LAN setup).

3. Verify the router responds:

   ```sh
   ping 192.168.1.1
   ```

4. Install the dashboard package from this project folder:

   ```sh
   cd /path/to/my-rack-e-dashboard
   ./scripts/install-and-activate.sh
   ```

5. Open the printed manager URL in a browser (usually `http://192.168.1.1/mx65/`), paste the token from the run, and click **Save** then **Check**.
6. Run:

   ```sh
   ./scripts/check-status.sh
   ```

   This verifies:

   - OpenWrt release
   - DHCP service
   - `fw4` firewall ruleset validity
   - dashboard file state and token presence

7. Save the manager token and router backup from the script output before changing network sections.

## Recovery posture

Before changing addressing, VLANs, firewall policy, or HTTPS:

```sh
python3 scripts/mx65ctl.py --host 192.168.1.1 backup
```

Keep a known-good backup and a direct Ethernet path to the router.
