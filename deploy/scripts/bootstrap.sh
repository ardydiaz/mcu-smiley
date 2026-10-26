#!/usr/bin/env bash
# One-time (idempotent) server setup for MCU Smiley on Ubuntu 26.04.
# Usage: sudo bash deploy/scripts/bootstrap.sh
set -euo pipefail

DOMAIN=smiley.mcu.edu.ph
DB_NAME=smiley_face
NODE_MAJOR=24
DEPLOY_DIR=$(cd "$(dirname "$0")/.." && pwd)
# Production config lives in the repo's smiley-backend/.env (developer's preferred location).
APP_ENV="$DEPLOY_DIR/../smiley-backend/.env"
OWNER=${SUDO_USER:-root}

[ "$(id -u)" -eq 0 ] || { echo "Run with sudo." >&2; exit 1; }
log() { printf '\n==> %s\n' "$*"; }

# Reads KEY=VALUE lines without shell evaluation; prints the value for one key.
env_value() {
  local file=$1 key=$2 line v
  while IFS= read -r line || [ -n "$line" ]; do
    [[ $line =~ ^[[:space:]]*${key}=(.*)$ ]] || continue
    v=${BASH_REMATCH[1]}
    [[ $v =~ ^\"(.*)\"$ || $v =~ ^\'(.*)\'$ ]] && v=${BASH_REMATCH[1]}
    printf '%s' "$v"
    return
  done < "$file"
}

log "Installing packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q nginx mysql-server ufw curl ca-certificates gnupg rsync openssl

if ! command -v node >/dev/null || [[ $(node -v) != v${NODE_MAJOR}.* ]]; then
  log "Installing Node.js ${NODE_MAJOR} LTS from NodeSource"
  install -d -m 755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  printf 'Package: nodejs\nPin: origin deb.nodesource.com\nPin-Priority: 600\n' > /etc/apt/preferences.d/nodesource
  apt-get update -q
  apt-get install -y -q nodejs
fi
# Let unattended-upgrades apply Node.js security releases too.
ns_origin=$(sed -n 's/^Origin: //p' /var/lib/apt/lists/deb.nodesource.com_*Release 2>/dev/null | head -1)
if [ -n "$ns_origin" ]; then
  printf 'Unattended-Upgrade::Origins-Pattern { "origin=%s"; };\n' "$ns_origin" > /etc/apt/apt.conf.d/52smiley-nodesource
fi
node -v

log "Creating service account and directories"
id smiley >/dev/null 2>&1 || useradd --system --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin smiley
install -d -m 755 -o root -g root /srv/smiley /srv/smiley/backend /var/www/smiley
install -d -m 750 -o root -g smiley /etc/smiley
install -d -m 700 -o root -g root /var/backups/smiley /etc/ssl/smiley

log "Hardening MySQL (localhost only)"
cat > /etc/mysql/mysql.conf.d/zz-smiley.cnf <<'EOF'
[mysqld]
bind-address = 127.0.0.1
mysqlx-bind-address = 127.0.0.1
local_infile = OFF
EOF
systemctl enable --now mysql
systemctl restart mysql

log "Generating secrets (kept if they already exist)"
if [ ! -f /etc/smiley/migrate.env ]; then
  install -m 600 -o root -g root /dev/null /etc/smiley/migrate.env
  printf 'DB_USER=smiley_migrate\nDB_PASSWORD=%s\n' "$(openssl rand -hex 24)" > /etc/smiley/migrate.env
fi
if [ ! -f "$APP_ENV" ]; then
  install -m 600 -o "$OWNER" -g "$OWNER" /dev/null "$APP_ENV"
  cat > "$APP_ENV" <<EOF
# MCU Smiley API production configuration. Applied by: bash deploy/scripts/deploy.sh
# (copied to /srv/smiley/backend/.env, root:smiley 0640). Keep this file mode 600.
NODE_ENV=production
HOST=127.0.0.1
PORT=4100
TRUST_PROXY=loopback
CORS_ORIGIN=https://${DOMAIN}
FRONTEND_URL=https://${DOMAIN}
PUBLIC_API_BASE_URL=https://${DOMAIN}/api

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_USER=smiley_app
DB_PASSWORD=$(openssl rand -hex 24)

JWT_SECRET=$(openssl rand -hex 48)
JWT_EXPIRES_IN=8h
ALLOW_ADMIN_REGISTRATION=false

# Microsoft Entra ID SSO. Use a SINGLE-TENANT app registration (your tenant ID, not
# "common"): accounts are matched by email. Redirect URI to register in Entra:
#   https://${DOMAIN}/api/auth/microsoft/callback
SSO_ENABLED=false
SSO_PROVIDER_NAME=Microsoft
SSO_SCOPES="openid email profile"
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_REDIRECT_URI=https://${DOMAIN}/api/auth/microsoft/callback

# Daily Teams digest of dissatisfied votes (blank webhook = disabled).
TEAMS_SMILEY_WEBHOOK_URL=
TEAMS_DIGEST_CRON="59 23 * * *"
TEAMS_DIGEST_TIMEZONE=Asia/Manila
EOF
fi
if [ "$(env_value "$APP_ENV" DB_USER)" != smiley_app ] || [ -z "$(env_value "$APP_ENV" DB_PASSWORD)" ]; then
  echo "$APP_ENV must use DB_USER=smiley_app with a DB_PASSWORD (move it aside to generate one)." >&2
  exit 1
fi
app_pw=$(env_value "$APP_ENV" DB_PASSWORD)
mig_pw=$(env_value /etc/smiley/migrate.env DB_PASSWORD)

log "Creating database and least-privilege accounts"
# Fed via stdin so passwords never appear in the process list.
mysql --protocol=socket -uroot <<SQL
DROP USER IF EXISTS ''@'localhost';
DROP DATABASE IF EXISTS test;
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'smiley_app'@'127.0.0.1' IDENTIFIED BY '${app_pw}';
ALTER USER 'smiley_app'@'127.0.0.1' IDENTIFIED BY '${app_pw}';
CREATE USER IF NOT EXISTS 'smiley_migrate'@'127.0.0.1' IDENTIFIED BY '${mig_pw}';
ALTER USER 'smiley_migrate'@'127.0.0.1' IDENTIFIED BY '${mig_pw}';
GRANT SELECT, INSERT, UPDATE, DELETE ON ${DB_NAME}.* TO 'smiley_app'@'127.0.0.1';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO 'smiley_migrate'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

if [ ! -f /etc/ssl/smiley/origin.pem ]; then
  log "Creating TEMPORARY self-signed certificate (replace with Cloudflare Origin CA)"
  openssl req -x509 -newkey rsa:2048 -nodes -days 90 -subj "/CN=${DOMAIN}" \
    -addext "subjectAltName=DNS:${DOMAIN}" \
    -keyout /etc/ssl/smiley/origin.key -out /etc/ssl/smiley/origin.pem 2>/dev/null
  chmod 600 /etc/ssl/smiley/origin.key /etc/ssl/smiley/origin.pem
fi

log "Installing helper scripts and systemd units"
install -m 755 "$DEPLOY_DIR/scripts/update-cloudflare-ips.sh" /usr/local/sbin/smiley-update-cloudflare-ips
install -m 755 "$DEPLOY_DIR/scripts/backup-db.sh" /usr/local/sbin/smiley-backup-db
install -m 644 "$DEPLOY_DIR"/systemd/*.service "$DEPLOY_DIR"/systemd/*.timer /etc/systemd/system/
systemctl daemon-reload

log "Configuring firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH comment 'ssh'
# 443/tcp is opened to Cloudflare's ranges only, by the script below.

log "Configuring nginx"
install -m 644 "$DEPLOY_DIR/nginx/smiley-http.conf" /etc/nginx/conf.d/smiley-http.conf
install -m 644 "$DEPLOY_DIR/nginx/smiley-headers.conf" /etc/nginx/snippets/smiley-headers.conf
install -m 644 "$DEPLOY_DIR/nginx/smiley-proxy.conf" /etc/nginx/snippets/smiley-proxy.conf
install -m 644 "$DEPLOY_DIR/nginx/smiley.conf" /etc/nginx/sites-available/smiley.conf
ln -sf /etc/nginx/sites-available/smiley.conf /etc/nginx/sites-enabled/smiley.conf
rm -f /etc/nginx/sites-enabled/default
/usr/local/sbin/smiley-update-cloudflare-ips   # writes real_ip config + ufw 443 rules
nginx -t
systemctl enable nginx
systemctl reload-or-restart nginx

ufw --force enable

log "Enabling services and timers"
systemctl enable smiley-backend
systemctl enable --now smiley-backup.timer cloudflare-ips.timer

log "Bootstrap complete. Next: bash deploy/scripts/deploy.sh (as your normal user)"
