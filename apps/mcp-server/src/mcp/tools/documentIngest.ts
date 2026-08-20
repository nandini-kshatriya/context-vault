import { randomUUID } from "node:crypto";
import { DocumentIngestInput, type DocumentIngestInputT } from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { vectorIndex } from "../../lib/vector.js";
import { chunkText } from "../../lib/chunkText.js";
import { logger } from "../../lib/logger.js";

export async function ingestDocument(
  input: DocumentIngestInputT
): Promise<{ documentId: string; chunkCount: number }> {
  const parsed = DocumentIngestInput.parse(input);
  const documentId = randomUUID();
  const now = Date.now();

  await redis.hset(`document:${documentId}`, {
    title: parsed.title,
    userId: parsed.userId,
    sourceUrl: parsed.sourceUrl ?? "",
    createdAt: now,
  });

  const chunks = chunkText(parsed.content);
  const ns = vectorIndex.namespace(parsed.userId);

  for (let i = 0; i < chunks.length; i++) {
    const chunkId = `${documentId}:chunk:${i}`;

    await redis.hset(`document:${documentId}:chunk:${i}`, {
      documentId,
      chunkIndex: i,
      content: chunks[i],
    });

    await ns.upsert({
      id: chunkId,
      data: chunks[i],
      metadata: {
        type: "document_chunk",
        documentId,
        chunkIndex: i,
      },
    });
  }

  logger.info({ documentId, chunkCount: chunks.length }, "Document ingested");

  return { documentId, chunkCount: chunks.length };
}