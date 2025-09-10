FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY src src
COPY tsconfig.json .
RUN npm run build


FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json .
RUN npm ci --only=production
COPY --from=builder /app/dist dist
EXPOSE 3000
CMD ["node", "start"]