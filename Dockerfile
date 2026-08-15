# ==========================================
# Stage 1: Build Frontend Client (Vite)
# ==========================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

# Install client dependencies
COPY client/package*.json ./
RUN npm ci

# Copy client source and build production bundle
COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Server Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server backend source
COPY server/src ./server/src

# Copy built frontend assets from client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose single unified port for Express API + Socket.IO + Static Web App
EXPOSE 4000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start Server
CMD ["node", "server/src/server.js"]
