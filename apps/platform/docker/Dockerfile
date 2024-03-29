FROM node:20-alpine AS base

# Fix javascript heap out of memory
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384

# Build source
FROM base AS builder

WORKDIR /app

# Copy all files
COPY . .

COPY .env /app/apps/frontend/.env

# Install pnpm
RUN corepack enable pnpm && pnpm i

# Disable Next telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the app
RUN pnpm build

# # Production image
FROM base AS runner

WORKDIR /app

# # Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/frontend/public ./public

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

ENV NEXT_TELEMETRY_DISABLED 1   

# Note: Don't expose ports here, Compose will handle that for us
CMD ["node", "apps/frontend/server.js"]
