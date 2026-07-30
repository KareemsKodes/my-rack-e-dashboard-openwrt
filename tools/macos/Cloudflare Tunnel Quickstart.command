#!/bin/zsh
set -e
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
REPO_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_DIR"

echo "Cloudflare Tunnel Quickstart"
echo
echo "Paste a tunnel token, drag a token file here, or press Return to validate only."
read -r "TOKEN_INPUT?> "

echo
echo "Optional public hostname/URL to test after install, or press Return to skip."
read -r "PUBLIC_URL?> "

args=()
if [[ -n "$TOKEN_INPUT" ]]; then
  TOKEN_INPUT="${TOKEN_INPUT/#\~/$HOME}"
  TOKEN_INPUT="${TOKEN_INPUT% }"
  if [[ -f "$TOKEN_INPUT" ]]; then
    args+=(--token-file "$TOKEN_INPUT")
  else
    args+=(--token "$TOKEN_INPUT")
  fi
fi

if [[ -n "$PUBLIC_URL" ]]; then
  args+=(--url "$PUBLIC_URL")
fi

"$REPO_DIR/scripts/cloudflare-quickstart.sh" "${args[@]}"

printf '\nDone. Press Return to close this window.'
read -r _
