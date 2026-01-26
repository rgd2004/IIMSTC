# Fly.io deployment Dockerfile for PKC CAG server

FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm install --production

# Copy server source code
COPY . .

# Environment
ENV NODE_ENV=production

# Expose the port used in server.js
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
