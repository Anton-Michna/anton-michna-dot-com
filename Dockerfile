FROM node:20-alpine
WORKDIR /app
COPY api/ ./api/
WORKDIR /app/api
RUN npm install
RUN npm run build
RUN ls -la dist/
EXPOSE 8080
CMD ["node", "dist/main.js"]