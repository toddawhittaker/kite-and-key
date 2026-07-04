#!/usr/bin/env sh
set -e

# Fail fast at container boot (dev + prod runtime) if PAYLOAD_SECRET is
# missing — an empty JWT signing secret means forgeable admin sessions.
# This check lives here (not in payload.config.ts) so `next build` stays
# env-free: the prod image's build stage runs with zero env vars and must
# not require a live DB or a real secret to compile.
if [ -z "$PAYLOAD_SECRET" ]; then
  echo "docker-entrypoint: PAYLOAD_SECRET is required (set it in .env) — refusing to boot." >&2
  exit 1
fi

# Applies committed Drizzle migrations before the app boots — keeps
# "migrate before boot" honest for both dev and prod images. No-ops cleanly
# if there is nothing new to apply. Requires DATABASE_URI to be set (via
# .env / compose environment).
echo "docker-entrypoint: running payload migrate..."
pnpm payload migrate

echo "docker-entrypoint: migrations applied, starting app..."
exec "$@"
