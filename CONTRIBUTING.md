# Contributing

Contributions must keep the project real, testable, and safe for firewall management.

## Standards

- Keep device-specific behavior in `device-profiles/` when possible.
- Do not enable destructive actions for untested hardware.
- Prefer OpenWrt UCI and service interfaces over ad hoc file edits.
- Validate firewall changes with `fw4 check`.
- Back up router configuration before applying network, firewall, or manager updates.
- Keep UI labels friendly and avoid exposing raw UCI paths unless an advanced view needs them.

## Checks

Run before submitting changes:

```sh
./scripts/repo-readiness-check.sh
```

Capture updated screenshots when changing the setup UI or dashboard:

```sh
python3 app.py
npx playwright screenshot --browser=chromium --viewport-size=1440,1050 --full-page http://127.0.0.1:8787 docs/assets/setup-wizard.png
```

## Source Hygiene

Keep generated files and private router data out of commits:

```sh
./scripts/repo-readiness-check.sh
find . -type f -size +5M
git status --short
```

The repository contains source, docs, profiles, scripts, and screenshots only.
