# MX65 Install Scripts

These scripts run from this Mac and talk to the MX over SSH.

Default target:

You can set a workspace default once instead of repeating `MX65_HOST`:

```sh
export MX65_DEFAULT_HOST=10.10.10.1
```

```sh
MX65_HOST=192.168.1.1
MX65_USER=root
```

Override the target inline when needed:

```sh
MX65_HOST=10.10.10.1 ./check-status.sh
```

## First Install / Activation

Run this after the Mac can SSH to the MX:

```sh
./install-and-activate.sh
```

The script runs:

- SSH preflight
- local router backup under `backups/`
- trusted local-manager deploy
- token save under `data/`
- installed file verification

Open the printed URL, paste the printed token, then click `Refresh`.

If the token is ever lost after a browser refresh, retrieve it again with:

```sh
./show-manager-token.sh
```

If SSH key auth is not set up yet:

```sh
./show-ssh-key-command.sh
```

Run the printed command on the MX once, then rerun `install-and-activate.sh`.

## Basic LAN Service Activation

Only run this if DHCP/DNS/firewall need to be forced on:

```sh
./activate-basic-services.sh
```

It sets `dhcp.lan.ignore=0`, enables/restarts `dnsmasq`, and enables/restarts `firewall`.

## Status

```sh
./check-status.sh
```

## Apply a Trusted Manager Update

```sh
./apply-trusted-update.sh
```

The update archive is SHA-256 checked on the MX, every managed file is checked against the manifest in staging, and the existing manager is backed up before replacement.

Need the token later? Recover it directly:

```sh
./show-manager-token.sh
```

## Roll Back the Local Manager

```sh
./rollback-manager.sh
```

## Cloudflare Tunnel

Install only when you have a Cloudflare Zero Trust tunnel token:

```sh
./cloudflare-quickstart.sh
```

The script prompts for the token without echoing it to the terminal.

You can still use a token file:

```sh
./cloudflare-quickstart.sh --token-file ~/mx65-cloudflare-token.txt
```

Validate later without reinstalling:

```sh
./cloudflare-validate.sh
```

Validate the public hostname too:

```sh
./cloudflare-validate.sh --url https://your-hostname.example.com
```

When the hostname must return a known string:

```sh
./cloudflare-validate.sh --url https://your-hostname.example.com --expect-text My-Rack-E
```
