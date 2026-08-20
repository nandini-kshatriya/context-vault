import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { StreamableHTTPTransport } from "@hono/mcp";
import { env } from "./lib/env.js";
import { redis } from "./lib/redis.js";
import { logger } from "./lib/logger.js";
import { createMcpServer } from "./mcp/server.js";

const app = new Hono();
const mcpServer = createMcpServer();
const transport = new StreamableHTTPTransport();

app.get("/healthz", (c) => c.json({ status: "ok" }));

app.all("/mcp", async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});

app.get("/api/events/stream", (c) => {
  return streamSSE(c, async (stream) => {
    let lastId = "0";

    while (true) {
      if (stream.closed) break;

      try {
        const entries = await redis.xrange(
          "mcp:events",
          `(${lastId}`,
          "+"
        );

                for (const [id, fields] of Object.entries(entries ?? {})) {
          const payload = (fields as Record<string, unknown>).payload;
          if (payload) {
            const dataStr =
              typeof payload === "string" ? payload : JSON.stringify(payload);
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