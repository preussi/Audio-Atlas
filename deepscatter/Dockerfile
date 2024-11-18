# Switch to node:20 as a test to bypass Alpine-specific issues
FROM node:20

WORKDIR /deepscatter
COPY package.json package-lock.json ./

# Update npm to the latest version
RUN npm install -g npm@latest

# Install dependencies
RUN npm install