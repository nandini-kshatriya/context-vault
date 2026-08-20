import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import {
  MemoryStoreInput,
  MemorySearchInput,
  MemoryRetrieveInput,
  MemoryUpdateInput,
  MemoryDeleteInput,
  DocumentIngestInput,
  DocumentSearchInput,
  ContextBuildInput,
} from "@contextvault/schemas";
import { storeMemory } from "./tools/memoryStore.js";
import { searchMemories } from "./tools/memorySearch.js";
import { retrieveMemory } from "./tools/memoryRetrieve.js";
import { updateMemory } from "./tools/memoryUpdate.js";
import { deleteMemory } from "./tools/memoryDelete.js";
import { ingestDocument } from "./tools/documentIngest.js";
import { searchDocuments } from "./tools/documentSearch.js";
import { buildContext } from "./tools/contextBuild.js";
import { emitEvent } from "../lib/events.js";
import { logger } from "../lib/logger.js";

export function createMcpServer() {
  const server = new McpServer({
    name: "contextvault-mcp-server",
    version: "0.0.1",
  });

  /**
   * Wraps a tool handler with timing + event emission, so every tool call
   * (success or failure) is logged to the mcp:events Redis Stream without
   * repeating this logic in every single tool.
   */
  function registerTool(
    name: string,
    description: string,
    schema: z.ZodRawShape,
    handler: (input: any) => Promise<unknown>
  ) {
    server.tool(name, description, schema, async (input: any) => {
      const start = Date.now();
      const userId =
        typeof input?.userId === "string" ? (input.userId as string) : undefined;

      try {
        const result = await handler(input);
        await emitEvent({
          toolName: name,
          status: "success",
          durationMs: Date.now() - start,
          userId,
          timestamp: Date.now(),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
      } catch (err) {
        await emitEvent({
          toolName: name,
          status: "error",
          durationMs: Date.now() - start,
          userId,
          timestamp: Date.now(),
          errorMessage: String(err),
        });
        logger.error({ err }, `${name} failed`);
        throw err;
      }
    });
  }

  registerTool(
    "memory_store",
    "Store a new memory for a user. Returns the generated memory id.",
    MemoryStoreInput.shape,
    storeMemory
  );

  registerTool(
    "memory_search",
    "Semantically search a user's memories. Returns matching memories with similarity scores.",
    MemorySearchInput.shape,
    searchMemories
  );

  registerTool(
    "memory_retrieve",
    "Retrieve a single memory by id.",
    MemoryRetrieveInput.shape,
    retrieveMemory
  );

  registerTool(
    "memory_update",
    "Update an existing memory's content and/or tags.",
    MemoryUpdateInput.shape,
    updateMemory
  );

  registerTool(
    "memory_delete",
    "Delete a memory by id.",
    MemoryDeleteInput.shape,
    deleteMemory
  );

  registerTool(
    "document_ingest",
    "Ingest a document: chunks the content, stores it, and indexes chunks for semantic search.",
    DocumentIngestInput.shape,
    ingestDocument
  );

  registerTool(
    "document_search",
    "Semantically search a user's ingested document chunks.",
    DocumentSearchInput.shape,
    searchDocuments
  );

  registerTool(
    "context_build",
    "Build a merged, ranked context block from a user's memories and document chunks for a given query.",
    ContextBuildInput.shape,
    buildContext
  );

  return server;
}