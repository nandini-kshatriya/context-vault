import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  MemoryStoreInput,
  MemorySearchInput,
  MemoryRetrieveInput,
  MemoryUpdateInput,
  MemoryDeleteInput,
} from "@contextvault/schemas";
import { storeMemory } from "./tools/memoryStore.js";
import { searchMemories } from "./tools/memorySearch.js";
import { retrieveMemory } from "./tools/memoryRetrieve.js";
import { updateMemory } from "./tools/memoryUpdate.js";
import { deleteMemory } from "./tools/memoryDelete.js";
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
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (err) {
        logger.error({ err }, "memory_store failed");
        throw err;
      }
    }
  );

  server.tool(
    "memory_search",
    "Semantically search a user's memories. Returns matching memories with similarity scores.",
    MemorySearchInput.shape,
    async (input) => {
      try {
        const result = await searchMemories(input);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (err) {
        logger.error({ err }, "memory_search failed");
        throw err;
      }
    }
  );

  server.tool(
    "memory_retrieve",
    "Retrieve a single memory by id.",
    MemoryRetrieveInput.shape,
    async (input) => {
      try {
        const result = await retrieveMemory(input);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (err) {
        logger.error({ err }, "memory_retrieve failed");
        throw err;
      }
    }
  );

  server.tool(
    "memory_update",
    "Update an existing memory's content and/or tags.",
    MemoryUpdateInput.shape,
    async (input) => {
      try {
        const result = await updateMemory(input);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (err) {
        logger.error({ err }, "memory_update failed");
        throw err;
      }
    }
  );

  server.tool(
    "memory_delete",
    "Delete a memory by id.",
    MemoryDeleteInput.shape,
    async (input) => {
      try {
        const result = await deleteMemory(input);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (err) {
        logger.error({ err }, "memory_delete failed");
        throw err;
      }
    }
  );

  return server;
}