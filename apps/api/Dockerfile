# syntax=docker/dockerfile:1
#
# Build context is the MONOREPO ROOT (not apps/api). In Coolify, set:
#   Base Directory: /
#   Dockerfile Location: apps/api/Dockerfile

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- deps + build ----
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm install --frozen-lockfile --filter univalle-api
RUN pnpm --filter univalle-api exec prisma generate

COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
RUN pnpm --filter univalle-api run build

# ---- production image ----
FROM base AS runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm install --frozen-lockfile --filter univalle-api --prod
RUN pnpm --filter univalle-api exec prisma generate

COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
