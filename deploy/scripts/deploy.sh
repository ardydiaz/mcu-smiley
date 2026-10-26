#!/usr/bin/env bash
# Builds a release as the current (unprivileged) user, then installs it with sudo.
# Re-run for every release:  git pull && bash deploy/scripts/deploy.sh
#
# Configuration comes from the repo's .env files (the developer's preferred location):
#   smiley-backend/.env   copied to /srv/smiley/backend/.env (root:smiley 0640)
#   smiley-frontend/.env  compiled into the frontend build (public; no secrets)
set -euo pipefail

[ "$(id -u)" -ne 0 ] || { echo "Run as your normal user; the script calls sudo where needed." >&2; exit 1; }
for need in npm rsync; do
  command -v "$need" >/dev/null || { echo "'$need' not found. Run first: sudo bash deploy/scripts/bootstrap.sh" >&2; exit 1; }
done
REPO=$(cd "$(dirname "$0")/../.." && pwd)
BACKEND_ENV="$REPO/smiley-backend/.env"
FRONTEND_ENV="$REPO/smiley-frontend/.env"
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
log() { printf '\n==> %s\n' "$*"; }

env_value() {  # file key -> value, without evaluating the file as shell
  sed -n "s/^[[:space:]]*$2=//p" "$1" | tail -1 | tr -d '\r' | sed -E 's/^"(.*)"$/\1/; s/^'\''(.*)'\''$/\1/'
}

# A dev edit to the repo .env now reaches production, so refuse obviously wrong values.
log "Checking .env files"
problems=()
for f in "$BACKEND_ENV" "$FRONTEND_ENV"; do [ -f "$f" ] || problems+=("missing $f"); done
if [ ${#problems[@]} -eq 0 ]; then
  [ "$(env_value "$BACKEND_ENV" NODE_ENV)" = production ] || problems+=("backend NODE_ENV must be production")
  [ "$(env_value "$BACKEND_ENV" HOST)" = 127.0.0.1 ] || problems+=("backend HOST must be 127.0.0.1")
  [ "$(env_value "$BACKEND_ENV" TRUST_PROXY)" = loopback ] || problems+=("backend TRUST_PROXY must be loopback")
  [ "$(env_value "$BACKEND_ENV" PORT)" = 4100 ] || problems+=("backend PORT must be 4100 (nginx upstream)")
  [ "$(env_value "$BACKEND_ENV" DB_USER)" = smiley_app ] || problems+=("backend DB_USER must be smiley_app")
  secret=$(env_value "$BACKEND_ENV" JWT_SECRET)
  [ ${#secret} -ge 64 ] || problems+=("backend JWT_SECRET must be at least 64 characters")
  for k in CORS_ORIGIN FRONTEND_URL PUBLIC_API_BASE_URL AZURE_REDIRECT_URI; do
    v=$(env_value "$BACKEND_ENV" "$k")
    [[ -z $v || $v == https://smiley.mcu.edu.ph* ]] || problems+=("backend $k must start with https://smiley.mcu.edu.ph (got $v)")
    [[ $v != *:4100* && $v != *:5173* ]] || problems+=("backend $k must not include a port (got $v)")
  done
  api=$(env_value "$FRONTEND_ENV" VITE_API_BASE_URL)
  [[ $api == /api || $api == https://smiley.mcu.edu.ph/api ]] || problems+=("frontend VITE_API_BASE_URL must be https://smiley.mcu.edu.ph/api (got $api)")
fi
if [ ${#problems[@]} -gt 0 ]; then
  printf '  - %s\n' "${problems[@]}" >&2
  echo "Fix the .env file(s) above and re-run. Nothing was changed." >&2
  exit 1
fi

log "Building frontend ($(git -C "$REPO" rev-parse --short HEAD))"
cd "$REPO/smiley-frontend"
npm ci --ignore-scripts --no-audit --no-fund
npm run build

log "Preparing backend (production dependencies only)"
rsync -a --delete --exclude node_modules --exclude '.env*' --exclude test/ --exclude .npm-cache \
  "$REPO/smiley-backend/" "$STAGE/backend/"
(cd "$STAGE/backend" && npm ci --omit=dev --ignore-scripts --no-audit --no-fund)

log "Installing release (sudo)"
# Code is root-owned and read-only to the service account; .env is readable by it, not world.
sudo rsync -a --delete --exclude /.env --chown=root:root --chmod=D755,F644 "$STAGE/backend/" /srv/smiley/backend/
sudo install -m 640 -o root -g smiley "$BACKEND_ENV" /srv/smiley/backend/.env
sudo rsync -a --delete --chown=root:root --chmod=D755,F644 "$REPO/smiley-frontend/dist/" /var/www/smiley/

log "Running database migrations (as smiley_migrate)"
# migrate.env's DB_USER/DB_PASSWORD take precedence over .env (dotenv never overrides).
sudo systemd-run --quiet --wait --pipe --collect --uid=smiley --gid=smiley \
  -p EnvironmentFile=/etc/smiley/migrate.env \
  -p WorkingDirectory=/srv/smiley/backend /usr/bin/node scripts/migrate.js

log "Restarting API"
sudo systemctl restart smiley-backend
for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:4100/api/ready >/dev/null 2>&1; then
    log "Deployed. API is ready."
    exit 0
  fi
  sleep 1
done
echo "API did not become ready; check: journalctl -u smiley-backend -n 50" >&2
exit 1
