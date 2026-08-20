import {
  ContextBuildInput,
  type ContextBuildInputT,
  type ContextBuildOutputT,
} from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { vectorIndex } from "../../lib/vector.js";
import { logger } from "../../lib/logger.js";

export async function buildContext(
  input: ContextBuildInputT
): Promise<ContextBuildOutputT> {
  const parsed = ContextBuildInput.parse(input);
  const ns = vectorIndex.namespace(parsed.userId);

  const results = await ns.query({
    data: parsed.query,
    topK: parsed.maxItems,
    includeMetadata: true,
  });

  const sources: ContextBuildOutputT["sources"] = [];
  const blocks: string[] = [];

  for (const r of results) {
    const meta = r.metadata as { type: "memory" | "document_chunk"; documentId?: string; chunkIndex?: number };

    if (meta.type === "memory") {
      const hash = await redis.hgetall<Record<string, string>>(`memory:${r.id}`);
      if (!hash || !hash.content) continue;
      blocks.push(`[Memory] ${hash.content}`);
      sources.push({ type: "memory", id: String(r.id), score: r.score });
    } else if (meta.type === "document_chunk" && meta.documentId !== undefined) {
      const chunkHash = await redis.hgetall<Record<string, string>>(
        `document:${meta.documentId}:chunk:${meta.chunkIndex}`
      );
      const docHash = await redis.hgetall<Record<string, string>>(`document:${meta.documentId}`);
      if (!chunkHash || !chunkHash.content) continue;
      const title = docHash?.title ?? "Untitled";
      blocks.push(`[Document: ${title}] ${chunkHash.content}`);
      sources.push({ type: "document_chunk", id: String(r.id), score: r.score });
    }
  }

  const contextBlock = blocks.join("\n\n---\n\n");

  logger.info({ userId: parsed.userId, sourceCount: sources.length }, "Context built");

  return { contextBlock, sources };
}