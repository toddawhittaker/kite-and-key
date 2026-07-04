# Multi-stage build: base -> deps -> dev (local, hot-reload) / build -> prod (runner).
# node:22-bookworm-slim (glibc) — avoids Alpine/musl native-module rebuild issues
# with sharp and Payload's image handling.

FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

# --- deps: install once, reused by dev + build ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# --- dev target: source is bind-mounted at runtime, not copied here ---
FROM deps AS dev
ENV NODE_ENV=development
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 3000
CMD ["pnpm", "dev"]

# --- build: compile the production app ---
FROM deps AS build
COPY . .
# Payload's config is imported at build time to generate the admin import map,
# but must not require a live DB connection (devops-reviewer to confirm).
RUN pnpm build

# --- prod: runner image, no source copied beyond the build output + prod deps ---
FROM base AS prod
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/.npmrc ./.npmrc
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 3000
CMD ["pnpm", "start"]
