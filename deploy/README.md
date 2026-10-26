# MCU Smiley — Production Deployment

Target: Ubuntu 26.04, on-premise, `https://smiley.mcu.edu.ph`, proxied through Cloudflare.

```
Browser ──HTTPS──► Cloudflare ──HTTPS (Origin CA cert)──► edge NAT :443 ──► this server
                                                                     │
                                       ufw: 443 open to Cloudflare IPs only
                                                                     ▼
                         nginx :443 ── /        → /var/www/smiley (static React build)
                                   └── /api/*   → 127.0.0.1:4100 (Node API, systemd, user "smiley")
                                                        └──► MySQL 8.4 on 127.0.0.1:3306
```

| Item | Location |
| --- | --- |
| Source checkout (build here, as your user) | `/opt/mcu-smiley` |
| Backend release (root-owned, read-only) | `/srv/smiley/backend` |
| Frontend release | `/var/www/smiley` |
| API config + secrets (edit here; gitignored, mode 600) | `/opt/mcu-smiley/smiley-backend/.env` |
| Frontend build settings (public, no secrets) | `/opt/mcu-smiley/smiley-frontend/.env` |
| Running copy of the API config (`root:smiley 0640`, written by deploy) | `/srv/smiley/backend/.env` |
| Migration DB credentials (`root 0600`) | `/etc/smiley/migrate.env` |
| TLS cert/key | `/etc/ssl/smiley/origin.pem`, `origin.key` |
| Backups (nightly, 14 days) | `/var/backups/smiley` |
| nginx logs (query strings stripped) | `/var/log/nginx/smiley.*.log` |

## First-time setup

1. **Edge router/firewall:** forward TCP **443** on the public IP to `172.16.18.102:443`. Port 80 is not needed. If the edge firewall supports it, allow only [Cloudflare's IP ranges](https://www.cloudflare.com/ips/).
2. `sudo bash deploy/scripts/bootstrap.sh` installs nginx, MySQL 8.4, Node.js 24 LTS and ufw, then creates the `smiley` service account, the database accounts, the firewall rules and the timers. If `smiley-backend/.env` doesn't exist, it generates one with production values and fresh secrets. It is safe to re-run.
3. `bash deploy/scripts/deploy.sh` (as your normal user, **not** sudo) checks both `.env` files, then builds the app, installs it, runs the migrations and starts the API. It refuses to deploy development values such as a `localhost` API URL, a dev-server port, a database user other than `smiley_app`, or missing proxy settings.
4. `sudo bash deploy/scripts/create-admin.sh` creates the first administrator. HTTP registration is blocked at nginx.
5. Configure Cloudflare SSL (below). Until the Origin CA certificate is installed, the origin uses a temporary self-signed certificate, which Cloudflare accepts only in *Full* (not *Full (strict)*) mode.

## Cloudflare configuration

**SSL/TLS: Origin certificate**
1. SSL/TLS → Origin Server → **Create Certificate**: RSA 2048, hostname `smiley.mcu.edu.ph`, 15 years.
2. On the server, paste the certificate into `/etc/ssl/smiley/origin.pem` and the private key into `/etc/ssl/smiley/origin.key` (`sudo nano …`). Then:
   ```bash
   sudo chmod 600 /etc/ssl/smiley/origin.*
   sudo nginx -t && sudo systemctl reload nginx
   ```

**SSL/TLS: encryption mode: Full (strict)**
The SSL mode is zone-wide and affects every `mcu.edu.ph` site. Rather than changing it for the whole zone, add a rule: Rules → **Configuration Rules** → *Hostname equals `smiley.mcu.edu.ph`* → SSL: **Full (strict)**. Never use *Flexible*.

**SSL/TLS: Edge Certificates**
Always Use HTTPS: **On** · Minimum TLS: **1.2** · TLS 1.3: **On**. nginx already sends HSTS.

**Authenticated Origin Pulls** (optional; nginx then accepts only connections that carry Cloudflare's client certificate)
1. SSL/TLS → Origin Server → Authenticated Origin Pulls: **On**.
2. Then on the server:
   ```bash
   sudo curl -fsSo /etc/ssl/smiley/cloudflare-origin-pull-ca.pem \
     https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem
   ```
   Uncomment `ssl_client_certificate` and `ssl_verify_client` in `/etc/nginx/sites-available/smiley.conf` (and in `deploy/nginx/smiley.conf`). Then run `sudo nginx -t && sudo systemctl reload nginx`.
   The zone-level certificate is shared by all Cloudflare customers. For stronger isolation, use per-hostname AOP with your own certificate.

**Caching:** Rules → **Cache Rules**: *Hostname equals `smiley.mcu.edu.ph` AND URI Path starts with `/api/`* → **Bypass cache**. This matters because Cloudflare caches `.xlsx` and `.csv` by default, which would include the Teams digest report download.

**Scripts:** for this hostname, turn **Rocket Loader** and **Email Address Obfuscation** off (Configuration Rule). Both inject scripts that the site's Content-Security-Policy blocks.

**Security (recommended)**
- WAF → Rate limiting rule: URI Path equals `/api/auth/login` → block above ~5 requests / 10 s per IP.
- If kiosks only ever run on campus, add a WAF custom rule: *(URI Path starts with `/api/kiosk/` OR (URI Path equals `/api/votes` AND method POST)) AND IP source address not in {campus egress IPs}* → **Block**. Voting and terminal reservation are unauthenticated by design, so without this rule anyone on the internet can call them.
- Don't apply Bot Fight Mode or challenges to `/api/*`. Kiosk fetch calls can't solve challenges.

## Day-2 operations

```bash
# Release a new version (git pull deploys by itself once the hook is enabled, see below)
cd /opt/mcu-smiley && git pull && bash deploy/scripts/deploy.sh
# Roll back: check out the previous commit and redeploy
git checkout <previous-sha> && bash deploy/scripts/deploy.sh

# Status and logs
systemctl status smiley-backend nginx mysql
journalctl -u smiley-backend -f
sudo tail -f /var/log/nginx/smiley.access.log

# Change configuration (SSO, Teams webhook, …): edit the repo .env, then redeploy
nano /opt/mcu-smiley/smiley-backend/.env && bash deploy/scripts/deploy.sh

# Backups
sudo systemctl start smiley-backup.service            # on demand
sudo ls -lh /var/backups/smiley
gunzip -c /var/backups/smiley/<file>.sql.gz | sudo mysql   # restore (overwrites!)

# API docs (not public): from your workstation
ssh -L 4100:127.0.0.1:4100 systemadmin@<server>   # then open http://localhost:4100/api/docs
```

- **Auto-deploy on pull:** `git config core.hooksPath deploy/hooks` (once, in `/opt/mcu-smiley`) makes every `git pull` on `main` run `deploy.sh`, which asks for the sudo password. `SMILEY_SKIP_DEPLOY=1 git pull` skips it once; `git config --unset core.hooksPath` turns it off. A pull from an editor button has no terminal for sudo, so it prints a warning and production stays on the old version.
- **Copy backups off this host** (NAS or object storage). Local backups don't survive disk loss.
- Rotating `JWT_SECRET` in `smiley-backend/.env` (then redeploy) logs everyone out. Do it if you suspect a leak.
- Security updates: unattended-upgrades covers Ubuntu packages and Node.js (NodeSource). Run `npm audit --omit=dev` in `smiley-backend` before each release.
- Cloudflare IP ranges refresh weekly (`cloudflare-ips.timer`). Run `sudo smiley-update-cloudflare-ips` to refresh by hand.

## Security measures in place

- **Network:** origin port 443 reachable only from Cloudflare (ufw). MySQL and the API listen on localhost only. Unknown hostnames are refused at the TLS handshake. Port 80 is closed.
- **Real client IPs:** nginx restores the visitor IP from `CF-Connecting-IP` (trusted only from Cloudflare ranges) and Express trusts only the local proxy (`TRUST_PROXY=loopback`). Without this, every request looks like it comes from 127.0.0.1, and 10 failed logins by anyone lock out all admins.
- **Least privilege:** the API runs as `smiley` (no shell, no home) under a systemd sandbox. Its code is root-owned and read-only. The runtime DB account has only SELECT/INSERT/UPDATE/DELETE; schema changes use a separate migration account.
- **Secrets:** generated at bootstrap and stored in the gitignored `smiley-backend/.env` (mode 600). The server copy is readable only by root and the service account. The migration account's password is kept separately in `/etc/smiley/migrate.env` (root only). Admin passwords are entered interactively and never appear in argv or shell history.
- **HTTP hardening:** strict CSP, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, nginx rate limits, a 64 KB body limit, and Swagger UI and `/api/auth/register` blocked.
- **Logs:** nginx logs paths without query strings or referrers, because SSO callbacks and Teams download links carry tokens in the URL.
- **Supply chain:** `npm ci` from the lockfile with `--ignore-scripts`, and production dependencies only on the server.

## Known residual risks (application level)

- Kiosk voting and terminal-reservation endpoints are unauthenticated by design. Use the Cloudflare campus-IP rule above.
- Admin JWTs live in browser `localStorage`, and on SSO the token arrives via the URL. The CSP and no-referrer policy limit the exposure.
- SSO matches accounts by email address. Use a **single-tenant** Entra app registration only.
- The app's in-memory rate limits are per public IP. Campus devices behind one NAT share a bucket (votes: 60/min, logins: 10 per 15 min).
- `exceljs` depends on a `uuid` version with a moderate advisory (buffer API unused by exceljs). The only fix is a breaking downgrade, so it is accepted for now.
