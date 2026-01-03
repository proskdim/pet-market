# ================================
# Build Stage
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular SSR application
RUN npx nx build pet-market-web --configuration=production

# ================================
# Production Stage
# ================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 angular

# Copy built application
COPY --from=builder /app/dist/apps/pet-market-web ./

# Install only production dependencies needed for SSR
RUN npm init -y && \
    npm install express@5

# Set ownership
RUN chown -R angular:nodejs /app

USER angular

# Expose the port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000 || exit 1

# Start the SSR server
CMD ["node", "server/server.mjs"]

