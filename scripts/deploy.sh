#!/usr/bin/env bash
# Build and deploy to the Contabo server (pm2 "oratorio-web").
# Usage: scripts/deploy.sh   (needs SSH access to the server)
set -euo pipefail
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
# Upload new static chunks first and never delete old ones, so a visitor with
# the site open during an update can still load the files their page expects.
rsync -az --chmod=D755,F644 -e "ssh -p 1993" "$D/.next/static/" root@83.171.249.122:/var/www/oratoriogroup/app/.next/static/
rsync -az --chmod=D755,F644 --delete -e "ssh -p 1993" --exclude .env --exclude .next/static "$D/" root@83.171.249.122:/var/www/oratoriogroup/app/
ssh -p 1993 root@83.171.249.122 'pm2 restart oratorio-web --update-env >/dev/null && sleep 4 && for p in / /register /livestream /images/logo-color.webp /videos/glimpse.mp4; do curl -sk -o /dev/null -w "$p %{http_code}\n" --resolve oratoriogroup.org:443:127.0.0.1 https://oratoriogroup.org$p; done'
rm -rf "$D"
