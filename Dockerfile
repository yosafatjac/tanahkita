# syntax=docker/dockerfile:1
# =============================================================================
# TanahKita — Hardened Multi-Stage Dockerfile (Tag: sec-0.2 / v0.2)
# - Base image pinned to immutable SHA-256 digest (node:22-alpine3.21)
# - npm ci --ignore-scripts to block malicious postinstall scripts (Shai-Hulud mitigation)
# - Non-root execution as user `nextjs` (UID 1001, GID 1001)
# - Zero build toolchains, caches, or secrets in the final runner stage
# =============================================================================

# Stage 1: Install production & build dependencies cleanly
FROM node:22-alpine3.21@sha256:92d5f72b1086942a22ff26770a764c00557e630ca27b4b8fffa1c0121916f227 AS deps
WORKDIR "/app/Pengembangan Aplikasi Web"

# Install patched OS security updates in Alpine
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY ["Pengembangan Aplikasi Web/package.json", "Pengembangan Aplikasi Web/package-lock.json", "./"]
RUN npm ci --ignore-scripts

# Stage 2: Generate Prisma Client & build Next.js production bundle
FROM node:22-alpine3.21@sha256:92d5f72b1086942a22ff26770a764c00557e630ca27b4b8fffa1c0121916f227 AS builder
WORKDIR "/app/Pengembangan Aplikasi Web"

COPY --from=deps ["/app/Pengembangan Aplikasi Web/node_modules", "./node_modules"]
COPY ["Pengembangan Aplikasi Web/", "./"]

ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# Stage 3: Minimal, hardened production runner (non-root UID 1001:1001)
FROM node:22-alpine3.21@sha256:92d5f72b1086942a22ff26770a764c00557e630ca27b4b8fffa1c0121916f227 AS runner
WORKDIR "/app/Pengembangan Aplikasi Web"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Apply latest Alpine security patches and create non-root user/group (1001:1001)
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/* \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy only necessary runtime artifacts with strict ownership
COPY --from=builder --chown=nextjs:nodejs ["/app/Pengembangan Aplikasi Web/public", "./public"]
COPY --from=builder --chown=nextjs:nodejs ["/app/Pengembangan Aplikasi Web/.next", "./.next"]
COPY --from=builder --chown=nextjs:nodejs ["/app/Pengembangan Aplikasi Web/node_modules", "./node_modules"]
COPY --from=builder --chown=nextjs:nodejs ["/app/Pengembangan Aplikasi Web/package.json", "./package.json"]
COPY --from=builder --chown=nextjs:nodejs ["/app/Pengembangan Aplikasi Web/src/generated", "./src/generated"]

USER 1001:1001
EXPOSE 3000

CMD ["npm", "run", "start"]
