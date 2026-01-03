# ================================
# Build Stage
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies with frozen lockfile
RUN npm ci --legacy-peer-deps

# Copy only necessary source files
COPY nx.json tsconfig.base.json ./
COPY apps/pet-market-web ./apps/pet-market-web

# Build the Angular SSR application
RUN npx nx build pet-market-web --configuration=production

# ================================
# Production Stage
# ================================
FROM node:22-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 angular

# Copy built application with correct ownership
COPY --from=builder --chown=angular:nodejs /app/dist/apps/pet-market-web ./

# Install express runtime dependency required by the Angular SSR server
RUN npm init -y && \
    npm install express@5 --omit=dev && \
    npm cache clean --force && \
    chown -R angular:nodejs /app

USER angular

# Expose the port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000 || exit 1

# Use dumb-init for proper PID 1 signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the SSR server
CMD ["node", "server/server.mjs"]
