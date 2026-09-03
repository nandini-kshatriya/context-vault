# ---- Build ----
FROM node:22-alpine AS build
RUN npm install -g pnpm@11
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@contextvault/schemas" build
RUN pnpm --filter "@contextvault/dashboard" build

# ---- Runtime ----
FROM node:22-alpine AS runtime
RUN npm install -g pnpm@11
WORKDIR /app
RUN addgroup -S contextvault && adduser -S contextvault -G contextvault

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/packages/schemas ./packages/schemas
COPY --from=build /app/apps/dashboard ./apps/dashboard

USER contextvault
WORKDIR /app/apps/dashboard
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node_modules/.bin/next", "start"]