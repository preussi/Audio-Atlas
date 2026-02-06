FROM node:22-alpine

WORKDIR /app

# Copy root workspace config and lockfile
COPY package.json package-lock.json ./

# Copy package.json files for workspace resolution
COPY deepscatter/package.json deepscatter/
COPY frontend/package.json frontend/

# Copy pre-built deepscatter dist (must be built before docker build)
COPY deepscatter/dist/ deepscatter/dist/

# Remove prepare script so npm ci doesn't try to rebuild deepscatter from source
RUN npm pkg --workspace=deepscatter delete scripts.prepare

# Install dependencies (workspace-aware)
RUN npm ci

# Copy frontend source
COPY frontend/ frontend/

WORKDIR /app/frontend

EXPOSE 3000

CMD ["npm", "run", "dev"]
