# ---- Build ----
FROM node:22-alpine AS build
RUN npm install -g pnpm@11
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@contextvault/schemas" build
RUN pnpm --filter "@contextvault/mcp-server" build

# ---- Runtime: slim final image ----
FROM node:22-alpine AS runtime
RUN npm install -g pnpm@11
WORKDIR /app
RUN addgroup -S contextvault && adduser -S contextvault -G contextvault

COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/package.json ./
COPY --from=build /app/packages/schemas/package.json ./packages/schemas/package.json
COPY --from=build /app/packages/schemas/dist ./packages/schemas/dist
COPY --from=build /app/apps/mcp-server/package.json ./apps/mcp-server/package.json
COPY --from=build /app/apps/mcp-server/dist ./apps/mcp-server/dist

RUN pnpm install --prod --frozen-lockfile --filter "@contextvault/mcp-server..."

USER contextvault
WORKDIR /app/apps/mcp-server
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/healthz || exit 1

CMD ["node", "dist/index.js"]