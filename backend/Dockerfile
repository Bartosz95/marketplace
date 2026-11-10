FROM node:26.13-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY src src
COPY tsconfig.json .
RUN npm run build

FROM node:26.13-alpine
WORKDIR /app
COPY --from=builder /app/package*.json .
RUN npm ci
COPY --from=builder /app/dist dist
EXPOSE 3000
CMD ["npm", "start"]