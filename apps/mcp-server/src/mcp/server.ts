import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MemoryStoreInput } from "@contextvault/schemas";
import { storeMemory } from "./tools/memoryStore.js";
import { logger } from "../lib/logger.js";

export function createMcpServer() {
  const server = new McpServer({
    name: "contextvault-mcp-server",
    version: "0.0.1",
  });

  server.tool(
    "memory_store",
    "Store a new memory for a user. Returns the generated memory id.",
    MemoryStoreInput.shape,
    async (input) => {
      try {
        const result = await storeMemory(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (err) {
        logger.error({ err }, "memory_store failed");
        throw err;
      }
    }
  );

  return server;
}