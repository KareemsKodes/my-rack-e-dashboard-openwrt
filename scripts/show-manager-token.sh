#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

HOST="${MX65_HOST:-${MX65_DEFAULT_HOST:-192.168.1.1}}"
USER="${MX65_USER:-root}"

if [ "$#" -ge 1 ]; then
  HOST="$1"
fi

if [ "$#" -ge 2 ]; then
  USER="$2"
fi

python3 "$SCRIPT_DIR/mx65ctl.py" --host "$HOST" --user "$USER" manager-token
