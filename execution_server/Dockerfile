# Dockerfile
FROM node:20-alpine

# Install Docker CLI
RUN apk add --no-cache docker-cli

# Create sandbox directory with proper permissions
RUN mkdir -p /sandbox && \
    chmod 777 /sandbox

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]