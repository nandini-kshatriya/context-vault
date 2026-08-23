import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { StreamableHTTPTransport } from "@hono/mcp";
import { env } from "./lib/env.js";
import { redis } from "./lib/redis.js";
import { logger } from "./lib/logger.js";
import { createMcpServer } from "./mcp/server.js";
import memoriesRoute from "./rest/routes/memories.js";
import documentsRoute from "./rest/routes/documents.js";
import searchRoute from "./rest/routes/search.js";
import contextRoute from "./rest/routes/context.js";
import analyticsRoute from "./rest/routes/analytics.js";

const app = new Hono();
const mcpServer = createMcpServer();
const transport = new StreamableHTTPTransport();

app.use(
  "/api/*",
  cors({
    origin: env.NODE_ENV === "production" ? "https://REPLACE_WITH_DASHBOARD_DOMAIN" : "http://localhost:3000",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/healthz", (c) => c.json({ status: "ok" }));

app.all("/mcp", async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});

app.route("/api/memories", memoriesRoute);
app.route("/api/documents", documentsRoute);
app.route("/api/search", searchRoute);
app.route("/api/context", contextRoute);
app.route("/api/analytics", analyticsRoute);

app.get("/api/events/stream", (c) => {
  return streamSSE(c, async (stream) => {
    let lastId = "0";

    while (true) {
      if (stream.closed) break;

      try {
        const entries = await redis.xrange("mcp:events", `(${lastId}`, "+");

        for (const [id, fields] of Object.entries(entries ?? {})) {
          const payload = (fields as Record<string, unknown>).payload;
          if (payload) {
            const dataStr = typeof payload === "string" ? payload : JSON.stringify(payload);
            await stream.writeSSE({ data: dataStr, event: "message", id });
          }
          lastId = id;
        }
      } catch (err) {
        logger.error({ err }, "Error polling event stream");
      }

      await stream.sleep(1000);
    }
  });
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`ContextVault MCP server listening on port ${info.port}`);
});