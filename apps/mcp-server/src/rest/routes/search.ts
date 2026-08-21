import { Hono } from "hono";
import { MemorySearchInput } from "@contextvault/schemas";
import { searchMemories } from "../../mcp/tools/memorySearch.js";
import { logger } from "../../lib/logger.js";

const search = new Hono();

search.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const parsed = MemorySearchInput.parse(body);
    const result = await searchMemories(parsed);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "POST /api/search failed");
    return c.json({ error: String(err) }, 400);
  }
});

export default search;