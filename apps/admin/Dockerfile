# syntax=docker/dockerfile:1
#
# Build context is the MONOREPO ROOT (not apps/admin). In Coolify, set:
#   Base Directory: /
#   Dockerfile Location: apps/admin/Dockerfile

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- deps + build ----
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile --filter univalle-admin

COPY apps/admin ./apps/admin

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter univalle-admin run build

# ---- production image ----
FROM nginx:alpine AS runner
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

EXPOSE 80
