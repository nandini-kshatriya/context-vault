import { MemoryRetrieveInput, type MemoryRetrieveInputT, type MemoryT } from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { logger } from "../../lib/logger.js";
import { parseTags } from "../../lib/parseTags.js";

export async function retrieveMemory(input: MemoryRetrieveInputT): Promise<MemoryT> {
  const parsed = MemoryRetrieveInput.parse(input);
  const hash = await redis.hgetall<Record<string, string>>(`memory:${parsed.id}`);

  if (!hash || !hash.content) {
    throw new Error(`Memory ${parsed.id} not found`);
  }
  if (hash.userId !== parsed.userId) {
    throw new Error("Not authorized to access this memory");
  }

  logger.info({ id: parsed.id }, "Memory retrieved");

  return {
    id: parsed.id,
    content: hash.content,
    metadata: {
      userId: hash.userId,
      tags: parseTags(hash.tags),
      source: hash.source as "manual" | "agent" | "import",
      createdAt: Number(hash.createdAt),
      updatedAt: Number(hash.updatedAt),
    },
  };
}