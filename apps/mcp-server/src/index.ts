import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { StreamableHTTPTransport } from "@hono/mcp";
import { env } from "./lib/env.js";
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

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`ContextVault MCP server listening on port ${info.port}`);
});