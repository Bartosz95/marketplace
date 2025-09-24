FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY src src
COPY tsconfig.json .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/package*.json .
RUN npm ci --only=listingion
COPY --from=builder /app/dist dist
COPY --from=builder /app/src/images-api/uploads /app/dist/images-api/uploads
EXPOSE 3000
CMD ["npm", "start"]