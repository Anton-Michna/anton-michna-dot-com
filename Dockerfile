FROM node:20-alpine
WORKDIR /app
COPY api/ ./api/
WORKDIR /app/api
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]