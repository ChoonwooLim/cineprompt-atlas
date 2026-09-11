# CUSTOM — Orbitron must use this file instead of its Node 20 template.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build:orbitron

FROM nginx:stable-alpine AS runtime
ENV PORT=3000
COPY --from=build /app/dist-orbitron /usr/share/nginx/html
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/healthz" || exit 1
