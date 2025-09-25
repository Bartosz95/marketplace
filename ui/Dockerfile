# Stage 1: Dependency Installation
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Stage 2: Build the Next.js application
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production Runtime
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Set the standalone output directory for Next.js
# This requires `output: 'standalone'` in next.config.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]