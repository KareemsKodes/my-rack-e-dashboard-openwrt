#!/bin/sh
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
HOST="${MX65_HOST:-${MX65_DEFAULT_HOST:-192.168.1.1}}"
USER="${MX65_USER:-root}"

has_token_arg=0
for arg in "$@"; do
  case "$arg" in
    --token|--token=*|--token-file|--token-file=*) has_token_arg=1 ;;
  esac
done

if [ "$has_token_arg" -eq 0 ] && [ -z "${MX65_CLOUDFLARE_TOKEN:-}" ] && [ -t 0 ]; then
  printf 'Paste Cloudflare tunnel token, or press Return to validate only.\n'
  printf 'Token input is hidden: '
  old_stty="$(stty -g 2>/dev/null || true)"
  stty -echo 2>/dev/null || true
  IFS= read -r token_input
  [ -z "$old_stty" ] || stty "$old_stty" 2>/dev/null || true
  printf '\n'
  if [ -n "$token_input" ]; then
    set -- --token "$token_input" "$@"
  fi
fi

exec python3 "$DIR/mx65ctl.py" --host "$HOST" --user "$USER" cloudflare-quickstart "$@"
