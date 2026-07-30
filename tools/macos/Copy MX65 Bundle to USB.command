#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
REPO_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
USB="/Volumes/MX65FLASH"
BUNDLE="$REPO_DIR/downloads/stock-mx65-conversion"

FILES=(
  "uboot_mx65"
  "uboot_mx65_small"
  "openwrt-bcm53xx-generic-meraki_mx65-initramfs.bin"
  "openwrt-bcm53xx-generic-meraki_mx65-squashfs.sysupgrade.bin"
  "READ_ME_FIRST_MX65.txt"
)

echo "MX65 stock conversion USB copy"
echo

if [[ ! -d "$USB" ]]; then
  echo "USB not found at: $USB"
  echo "Plug/format the USB as FAT32 MBR and name it MX65FLASH."
  read -k 1 "?Press any key to close."
  exit 1
fi

if ! command -v diskutil >/dev/null 2>&1; then
  echo "diskutil not found. This script needs macOS diskutil to verify the USB format."
  read -k 1 "?Press any key to close."
  exit 1
fi

DEVICE_ID="$(diskutil info "$USB" | awk -F: '/Device Identifier/ {gsub(/^ +| +$/, "", $2); print $2; exit}')"
WHOLE_DISK="$(diskutil info "$USB" | awk -F: '/Part of Whole/ {gsub(/^ +| +$/, "", $2); print $2; exit}')"
FS_NAME="$(diskutil info "$USB" | awk -F: '/File System Personality/ {gsub(/^ +| +$/, "", $2); print $2; exit}')"
SCHEME="$(diskutil list "/dev/$WHOLE_DISK" | awk '/0:/ {print $2; exit}')"

echo "USB volume: $USB"
echo "USB device: /dev/$DEVICE_ID"
echo "Parent disk: /dev/$WHOLE_DISK"
echo "Filesystem: $FS_NAME"
echo "Partition scheme: $SCHEME"
echo

if [[ "$FS_NAME" != "MS-DOS FAT32" || "$SCHEME" != "FDisk_partition_scheme" ]]; then
  echo "This USB is not in the required format."
  echo
  echo "Required:"
  echo "- MS-DOS FAT32"
  echo "- Master Boot Record / FDisk partition scheme"
  echo
  echo "To erase and format the correct USB disk, run this yourself after confirming /dev/$WHOLE_DISK is the USB:"
  echo "diskutil eraseDisk FAT32 MX65FLASH MBRFormat /dev/$WHOLE_DISK"
  echo
  echo "No files were copied."
  read -k 1 "?Press any key to close."
  exit 1
fi

if [[ ! -d "$BUNDLE" ]]; then
  echo "Bundle folder not found: $BUNDLE"
  read -k 1 "?Press any key to close."
  exit 1
fi

echo "Copying files to $USB ..."
for f in "${FILES[@]}"; do
  if [[ ! -f "$BUNDLE/$f" ]]; then
    echo "Missing bundle file: $f"
    read -k 1 "?Press any key to close."
    exit 1
  fi
  cp -f "$BUNDLE/$f" "$USB/$f"
done

sync

echo
echo "Verifying copied files ..."
for f in "${FILES[@]}"; do
  if [[ ! -f "$USB/$f" ]]; then
    echo "Missing on USB after copy: $f"
    read -k 1 "?Press any key to close."
    exit 1
  fi
  src_hash="$(shasum -a 256 "$BUNDLE/$f" | awk '{print $1}')"
  dst_hash="$(shasum -a 256 "$USB/$f" | awk '{print $1}')"
  if [[ "$src_hash" != "$dst_hash" ]]; then
    echo "Hash mismatch after copy: $f"
    read -k 1 "?Press any key to close."
    exit 1
  fi
  echo "OK  $f"
done

echo
echo "DONE. Open READ_ME_FIRST_MX65.txt on the USB before touching the router."
read -k 1 "?Press any key to close."
