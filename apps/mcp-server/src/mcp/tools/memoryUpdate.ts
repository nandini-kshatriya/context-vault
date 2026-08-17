import { MemoryUpdateInput, type MemoryUpdateInputT } from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { vectorIndex } from "../../lib/vector.js";
import { logger } from "../../lib/logger.js";
import { parseTags } from "../../lib/parseTags.js";

export async function updateMemory(input: MemoryUpdateInputT): Promise<{ id: string; updated: true }> {
  const parsed = MemoryUpdateInput.parse(input);
  const existing = await redis.hgetall<Record<string, string>>(`memory:${parsed.id}`);

  if (!existing || !existing.content) {
    throw new Error(`Memory ${parsed.id} not found`);
  }
  if (existing.userId !== parsed.userId) {
    throw new Error("Not authorized to update this memory");
  }

  const now = Date.now();
  const newContent = parsed.content ?? existing.content;
  const newTags = parsed.tags ?? parseTags(existing.tags);

  await redis.hset(`memory:${parsed.id}`, {
    content: newContent,
    tags: newTags,
    updatedAt: now,
  });

  const ns = vectorIndex.namespace(parsed.userId);
  await ns.upsert({
    id: parsed.id,
    data: newContent,
    metadata: {
      type: "memory",
      tags: newTags,
      createdAt: Number(existing.createdAt),
    },
  });

  logger.info({ id: parsed.id }, "Memory updated");

  return { id: parsed.id, updated: true };
}