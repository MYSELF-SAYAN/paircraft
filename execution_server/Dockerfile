# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy server files
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]
