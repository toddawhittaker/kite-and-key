#!/usr/bin/env sh
set -e

# Applies committed Drizzle migrations before the app boots — keeps
# "migrate before boot" honest for both dev and prod images. No-ops cleanly
# if there is nothing new to apply. Requires DATABASE_URI + PAYLOAD_SECRET
# to be set (via .env / compose environment).
echo "docker-entrypoint: running payload migrate..."
pnpm payload migrate

echo "docker-entrypoint: migrations applied, starting app..."
exec "$@"
