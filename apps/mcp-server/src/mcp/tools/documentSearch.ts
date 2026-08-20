import { DocumentSearchInput, type DocumentSearchInputT } from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { vectorIndex } from "../../lib/vector.js";
import { logger } from "../../lib/logger.js";

export async function searchDocuments(input: DocumentSearchInputT) {
  const parsed = DocumentSearchInput.parse(input);
  const ns = vectorIndex.namespace(parsed.userId);

  const results = await ns.query({
    data: parsed.query,
    topK: parsed.topK,
    includeMetadata: true,
    filter: "type = 'document_chunk'",
  });

  const hydrated = await Promise.all(
    results.map(async (r) => {
      const meta = r.metadata as { documentId: string; chunkIndex: number };
      const chunkHash = await redis.hgetall<Record<string, string>>(
        `document:${meta.documentId}:chunk:${meta.chunkIndex}`
      );
      const docHash = await redis.hgetall<Record<string, string>>(
        `document:${meta.documentId}`
      );

      if (!chunkHash || !chunkHash.content) return null;

      return {
        id: String(r.id),
        documentId: meta.documentId,
        chunkIndex: meta.chunkIndex,
        content: chunkHash.content,
        documentTitle: docHash?.title ?? "Untitled",
        score: r.score,
      };
    })
  );

  logger.info({ userId: parsed.userId, count: hydrated.length }, "Document search complete");

  return hydrated.filter((c): c is NonNullable<typeof c> => c !== null);
}