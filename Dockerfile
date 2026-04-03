FROM node:20-alpine AS builder
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci
COPY api/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/api/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main.js"]