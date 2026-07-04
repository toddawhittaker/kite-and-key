# Multi-stage build: base -> deps -> dev (local, hot-reload) / build -> prod (runner).
# node:22-bookworm-slim (glibc) — avoids Alpine/musl native-module rebuild issues
# with sharp and Payload's image handling.

FROM node:22-bookworm-slim AS base
ARG UID=1000
ARG GID=1000
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
# The base image ships a built-in `node` user at uid/gid 1000 (the common
# single-user-Linux-host default). Re-point it at a different UID/GID via
# --build-arg UID=... GID=... if the host user doesn't match, then own /app
# so files this container writes into the bind-mounted source tree
# (migrations, generated types, next-env.d.ts) land on the host owned by the
# host user instead of root.
RUN if [ "$UID" != "1000" ] || [ "$GID" != "1000" ]; then \
      groupmod -g "$GID" node && usermod -u "$UID" node; \
    fi \
    && chown -R node:node /app
USER node

# --- deps: install once, reused by dev + build ---
FROM base AS deps
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# --- dev target: source is bind-mounted at runtime, not copied here ---
FROM deps AS dev
ENV NODE_ENV=development
# Pre-create .next as the node user: Docker creates missing anonymous-volume
# mountpoints as root regardless of the active USER, and next dev (running
# as node) can't write into a root-owned directory.
RUN mkdir -p /app/.next
COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 3000
CMD ["pnpm", "dev"]

# --- build: compile the production app ---
FROM deps AS build
COPY --chown=node:node . .
# Payload's config is imported at build time to generate the admin import map,
# but must not require a live DB connection (devops-reviewer to confirm).
RUN pnpm build

# --- prod: runner image, no source copied beyond the build output + prod deps ---
FROM base AS prod
ENV NODE_ENV=production
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build --chown=node:node /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build --chown=node:node /app/.npmrc ./.npmrc
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
COPY --from=build --chown=node:node /app/tsconfig.json ./tsconfig.json
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/src ./src
COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 3000
CMD ["pnpm", "start"]
