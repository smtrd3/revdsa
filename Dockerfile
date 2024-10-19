# static site hosting configuration
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies
FROM base AS build
RUN mkdir -p /temp/deps
COPY . /temp/deps/
RUN cd /temp/deps && bun install && bun run build

FROM nginx:alpine
COPY --from=build /temp/deps/dist /usr/share/nginx/html

# run the app
EXPOSE 80