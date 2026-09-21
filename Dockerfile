# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — build the Vite bundle
#
# The toolchain (node, npm, TypeScript, ~200 MB of node_modules) only exists in
# this stage. Nothing from here ends up in the shipped image except dist/.
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy the manifests first so this layer is cached whenever only source
# files change. Dependency installs are the slow part of the build.
COPY package.json package-lock.json ./

# `npm ci` installs exactly what package-lock.json pins — reproducible builds.
# `npm install` may resolve newer versions and is not safe for CI.
RUN npm ci

COPY . .

# Runs `tsc -b && vite build` — a type error fails the image build.
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — serve the static bundle with nginx
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Traceability: stamped by the pipeline so a running container can be traced
# back to the exact commit and build that produced it.
ARG APP_VERSION=dev
ARG GIT_COMMIT=unknown

LABEL org.opencontainers.image.title="DeployHub — DevOps Deployment Dashboard" \
      org.opencontainers.image.source="https://github.com/kritiup/Codealpha_ci-cd-pipeline-using-azure" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_COMMIT}"

# Replace the stock server block with our SPA-aware config.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

# App Service routes public traffic to this port (see WEBSITES_PORT in
# infra/provision-azure.sh). 8080 is unprivileged, so nginx workers never
# need root to bind it.
EXPOSE 8080

# Docker-level liveness probe. App Service has its own health check pointed
# at the same path; this one makes `docker ps` useful locally.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
