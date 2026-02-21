# ============================================
# Base image with Alpine for smaller size
# ============================================
FROM node:20-alpine AS base

# Install required dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache libc6-compat python3 make g++

# ============================================
# Dependencies stage - cached separately
# ============================================
FROM base AS deps
WORKDIR /app

# Copy only package files first (better caching)
COPY package.json package-lock.json* ./

# Copy prisma files for postinstall script (prisma generate)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Set dummy DATABASE_URL for prisma generate during install
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Install dependencies
RUN npm install && npm cache clean --force

# ============================================
# Builder stage
# ============================================
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy prisma files first for generate
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of source code
COPY . .

# Disable telemetry and set dummy DATABASE_URL for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Build the application
RUN npm run build

# ============================================
# Production runner - minimal image
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with proper permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for migrations + seeding
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./

# Install runtime dependencies for migrations + seeding
# python3/make/g++ needed for bcrypt native build
RUN apk add --no-cache python3 make g++ && \
    npm install -g prisma tsx && \
    npm install dotenv pg @prisma/adapter-pg bcrypt && \
    npm cache clean --force && \
    apk del python3 make g++ && \
    chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations, seed if empty, then start server
CMD ["./docker-entrypoint.sh"]
