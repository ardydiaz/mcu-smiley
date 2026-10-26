#!/usr/bin/env bash
# Creates an administrator account interactively. Usage: sudo bash deploy/scripts/create-admin.sh
# The password is passed via the environment (not argv), so it never shows in `ps` or shell history.
# Database settings come from /srv/smiley/backend/.env, which the script loads itself.
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Run with sudo." >&2; exit 1; }
[ -f /srv/smiley/backend/scripts/create-admin.js ] && [ -f /srv/smiley/backend/.env ] \
  || { echo "App not deployed. Run first: bash deploy/scripts/deploy.sh" >&2; exit 1; }

read -rp "Admin name: " ADMIN_NAME
read -rp "Admin email: " ADMIN_EMAIL
read -rsp "Password (12+ characters): " ADMIN_PASSWORD; echo
read -rsp "Confirm password: " confirm; echo
[ "$ADMIN_PASSWORD" = "$confirm" ] || { echo "Passwords do not match." >&2; exit 1; }
unset confirm
export ADMIN_NAME ADMIN_EMAIL ADMIN_PASSWORD

cd /srv/smiley/backend
runuser -u smiley -- /usr/bin/node scripts/create-admin.js
