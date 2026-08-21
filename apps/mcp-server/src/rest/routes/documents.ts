import { Hono } from "hono";
import { DocumentIngestInput } from "@contextvault/schemas";
import { ingestDocument } from "../../mcp/tools/documentIngest.js";
import { listDocuments } from "../../lib/listDocuments.js";
import { logger } from "../../lib/logger.js";

const documents = new Hono();

documents.get("/", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  try {
    const result = await listDocuments(userId);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "GET /api/documents failed");
    return c.json({ error: "Failed to list documents" }, 500);
  }
});

documents.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const parsed = DocumentIngestInput.parse(body);
    const result = await ingestDocument(parsed);
    return c.json(result, 201);
  } catch (err) {
    logger.error({ err }, "POST /api/documents failed");
    return c.json({ error: String(err) }, 400);
  }
});

export default documents;