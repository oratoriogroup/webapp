#!/usr/bin/env bash
# Build and deploy to the Contabo server (pm2 "oratorio-web").
# Usage: scripts/deploy.sh   (needs SSH access to the server)
set -euo pipefail
trap 'echo "DEPLOY FAILED at line $LINENO" >&2' ERR
cd "$(dirname "$0")/.."
NEXT_TELEMETRY_DISABLED=1 npx next build
D=$(mktemp -d)
# mktemp makes an owner-only folder; the web server must be able to read files.
chmod 755 "$D"
cp -R .next/standalone/. "$D/"
mkdir -p "$D/.next"
cp -R .next/static "$D/.next/static"
# The standalone output can already contain a partial public/ folder; replace
# it so files never end up nested in public/public.
rm -rf "$D/public"
cp -R public "$D/public"
rm -rf "$D/.env" "$D/node_modules/@img" "$D/node_modules/sharp"
test -f "$D/public/images/logo-color.webp" || { echo "public/ copy failed"; exit 1; }
# Readable by the web server (macOS rsync has no --chmod; -a keeps these modes).
chmod -R u+rwX,go+rX,go-w "$D"
# Upload new static chunks first and never delete old ones, so a visitor with
# the site open during an update can still load the files their page expects.
rsync -az -e "ssh -p 1993" "$D/.next/static/" root@83.171.249.122:/var/www/oratoriogroup/app/.next/static/
rsync -az --delete -e "ssh -p 1993" --exclude .env --exclude .next/static "$D/" root@83.171.249.122:/var/www/oratoriogroup/app/
# After the reload, request the cached pages a few times so every worker
# rebuilds them at once (otherwise a worker can serve its old copy once).
ssh -p 1993 root@83.171.249.122 'pm2 reload /var/www/oratoriogroup/ecosystem.config.cjs --update-env >/dev/null && sleep 4 && for i in 1 2 3 4 5 6; do for p in / /register /livestream; do curl -sk -o /dev/null --resolve oratoriogroup.org:443:127.0.0.1 https://oratoriogroup.org$p; done; done; sleep 2; for p in / /register /livestream /images/logo-color.webp /videos/glimpse.mp4; do curl -sk -o /dev/null -w "$p %{http_code}\n" --resolve oratoriogroup.org:443:127.0.0.1 https://oratoriogroup.org$p; done'
rm -rf "$D"
