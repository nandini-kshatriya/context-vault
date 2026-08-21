import { Hono } from "hono";
import { ContextBuildInput } from "@contextvault/schemas";
import { buildContext } from "../../mcp/tools/contextBuild.js";
import { logger } from "../../lib/logger.js";

const context = new Hono();

context.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const parsed = ContextBuildInput.parse(body);
    const result = await buildContext(parsed);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "POST /api/context failed");
    return c.json({ error: String(err) }, 400);
  }
});

export default context;