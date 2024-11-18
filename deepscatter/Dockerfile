FROM node:20-alpine

WORKDIR /deepscatter
COPY package.json package-lock.json ./

# Update npm to the latest version
RUN npm install -g npm@latest

# Install dependencies
RUN npm install