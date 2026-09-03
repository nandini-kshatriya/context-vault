# ---- Build ----
FROM node:22-alpine AS build
RUN npm install -g pnpm@11
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@contextvault/schemas" build
RUN pnpm --filter "@contextvault/dashboard" build

# ---- Runtime: slim final image using Next.js standalone output ----
FROM node:22-alpine AS runtime
WORKDIR /app
RUN addgroup -S contextvault && adduser -S contextvault -G contextvault

COPY --from=build /app/apps/dashboard/.next/standalone ./
COPY --from=build /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=build /app/apps/dashboard/public ./apps/dashboard/public

USER contextvault
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "apps/dashboard/server.js"]