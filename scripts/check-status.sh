#!/bin/sh
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
HOST="${MX65_HOST:-${MX65_DEFAULT_HOST:-192.168.1.1}}"
USER="${MX65_USER:-root}"
exec python3 "$DIR/mx65ctl.py" --host "$HOST" --user "$USER" status "$@"
