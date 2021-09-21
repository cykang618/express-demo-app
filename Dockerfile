# syntax=docker/dockerfile:1
FROM node:16 AS test
WORKDIR /app

# install all dependencies
COPY package*.json ./
RUN npm ci

# copy source code
COPY src ./src
COPY test ./test
COPY tsconfig.json jest.config.js .env ./

# run unit test
RUN npm run test

# compile .ts to .js
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "start"]


# building production image
FROM node:16-alpine AS prod
WORKDIR /app

# install production dependencies
COPY package*.json ./
RUN npm ci --production

COPY --from=test /app/build ./build
COPY .env ./

EXPOSE 3000
CMD ["npm", "run", "start"]
