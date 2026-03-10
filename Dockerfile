FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first for better layer caching
COPY mvp/backend/package.json mvp/backend/package-lock.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY mvp/backend/ ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
