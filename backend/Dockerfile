# Base image
FROM node:20-alpine AS builder

# Working directory
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Install dependencies (cache optimized)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including dev (for build)
RUN npm install
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# --- Production Image ---
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
