# Multi-stage Dockerfile for Kolosal AI API Server (Railway optimized)

# Build stage
FROM node:20-alpine AS builder

# Railway build-time variables
ARG RAILWAY_SERVICE_NAME
ARG RAILWAY_ENVIRONMENT

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libc6-compat

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/api-server/package*.json ./packages/api-server/
COPY packages/test-utils/package*.json ./packages/test-utils/

# Install dependencies
# Railway cache mounts require specific format, using simple approach for now
RUN npm ci --only=production=false

# Copy source code and build scripts
COPY . .

# Build the project
# First generate any required files, then build all packages
RUN npm run build --workspaces

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies (including git for repo cloning)
RUN apk add --no-cache \
    dumb-init \
    git \
    && addgroup -g 1001 -S kolosal \
    && adduser -S kolosal -u 1001

WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/api-server/package*.json ./packages/api-server/
COPY packages/test-utils/package*.json ./packages/test-utils/

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/api-server/dist ./packages/api-server/dist
COPY --from=builder /app/packages/test-utils/dist ./packages/test-utils/dist

# Copy any additional required files
COPY --from=builder /app/scripts ./scripts

# Change ownership to non-root user
RUN chown -R kolosal:kolosal /app

# Create workspace directory for cloned repositories
RUN mkdir -p /app/workspace && chown -R kolosal:kolosal /app/workspace

# Switch to non-root user
USER kolosal

# Expose the default API port
EXPOSE 8080

# Set environment variables for Railway
ENV NODE_ENV=production
ENV KOLOSAL_CLI_API_HOST=0.0.0.0
ENV KOLOSAL_CLI_API_PORT=8080
ENV KOLOSAL_CLI_API_CORS=true

# Set default Google OAuth credentials (dummy values to prevent errors)
ENV GOOGLE_OAUTH_CLIENT_ID=default-client-id
ENV GOOGLE_OAUTH_CLIENT_SECRET=default-client-secret

# GitHub repository cloning configuration (optional - set these in Railway Dashboard > Variables)
# GITHUB_REPO_PATH      - Repository to clone at startup (format: owner/repo or full URL)
# GITHUB_ACCESS_TOKEN   - OAuth token for private repositories
# GITHUB_REPO_BRANCH    - Branch to clone (optional, defaults to main)
# AGENT_WORKSPACE_DIR   - Clone target directory (optional, defaults to /app/workspace)

# Railway will set the PORT environment variable
# Use it if available, otherwise default to 8080
ENV PORT=${PORT:-8080}
ENV KOLOSAL_CLI_API_PORT=${PORT:-8080}

# Health check (Railway compatible)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "\
    const http = require('http'); \
    const port = process.env.PORT || process.env.KOLOSAL_CLI_API_PORT || 8080; \
    const options = { \
      host: '0.0.0.0', \
      port: port, \
      path: '/healthz', \
      timeout: 2000 \
    }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) { \
        process.exit(0); \
      } else { \
        process.exit(1); \
      } \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end(); \
  "

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the API server
CMD ["npm", "start"]