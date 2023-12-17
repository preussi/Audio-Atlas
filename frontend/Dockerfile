FROM node:21-alpine
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm install -g npm@latest
RUN npm i next@latest
RUN npm i express cors dotenv express-validator
RUN npm install react-bootstrap bootstrap