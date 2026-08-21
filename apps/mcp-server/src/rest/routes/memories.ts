import { Hono } from "hono";
import { MemoryUpdateInput, MemoryDeleteInput, MemoryRetrieveInput } from "@contextvault/schemas";
import { listMemories } from "../../lib/listMemories.js";
import { retrieveMemory } from "../../mcp/tools/memoryRetrieve.js";
import { updateMemory } from "../../mcp/tools/memoryUpdate.js";
import { deleteMemory } from "../../mcp/tools/memoryDelete.js";
import { logger } from "../../lib/logger.js";

const memories = new Hono();

memories.get("/", async (c) => {
  const userId = c.req.query("userId");
  const page = Number(c.req.query("page") ?? "1");
  const pageSize = Number(c.req.query("pageSize") ?? "20");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  try {
    const result = await listMemories(userId, page, pageSize);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "GET /api/memories failed");
    return c.json({ error: "Failed to list memories" }, 500);
  }
});

memories.get("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  try {
    const parsed = MemoryRetrieveInput.parse({ id, userId });
    const result = await retrieveMemory(parsed);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "GET /api/memories/:id failed");
    return c.json({ error: String(err) }, 404);
  }
});

memories.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    const parsed = MemoryUpdateInput.parse({ id, ...body });
    const result = await updateMemory(parsed);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "PATCH /api/memories/:id failed");
    return c.json({ error: String(err) }, 400);
  }
});

memories.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  try {
    const parsed = MemoryDeleteInput.parse({ id, userId });
    const result = await deleteMemory(parsed);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "DELETE /api/memories/:id failed");
    return c.json({ error: String(err) }, 400);
  }
});

export default memories;