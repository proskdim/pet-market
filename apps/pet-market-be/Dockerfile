# ================================
# Build Stage
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies first for better caching
COPY package.json package-lock.json ./
COPY apps/pet-market-be/package.json ./apps/pet-market-be/

RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client for Linux (Alpine)
RUN npx prisma generate --schema=apps/pet-market-be/prisma/schema.prisma

# Build the backend
RUN npx nx build pet-market-be --configuration=production

# Prune dependencies for production
RUN npx nx run pet-market-be:prune

# ================================
# Production Stage
# ================================
FROM node:22-alpine AS production

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built application and pruned package files
COPY --from=builder /app/apps/pet-market-be/dist ./

# Copy Prisma schema and migrations for runtime migrations
COPY --from=builder /app/apps/pet-market-be/prisma/schema.prisma ./prisma/
COPY --from=builder /app/apps/pet-market-be/prisma/migrations ./prisma/migrations

# Install production dependencies (generates Prisma client for Linux)
RUN npm ci --omit=dev --legacy-peer-deps

# Set ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
# Note: Run migrations separately or set RUN_MIGRATIONS=true to run on startup
CMD ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"true\" ]; then npx prisma migrate deploy --schema=./prisma/schema.prisma; fi && node main.js"]
