#!/bin/zsh
set -e
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
REPO_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_DIR"
"$REPO_DIR/scripts/show-ssh-key-command.sh"
printf '\nDone. Press Return to close this window.'
read -r _
