import { MemoryDeleteInput, type MemoryDeleteInputT } from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { vectorIndex } from "../../lib/vector.js";
import { logger } from "../../lib/logger.js";

export async function deleteMemory(input: MemoryDeleteInputT): Promise<{ id: string; deleted: true }> {
  const parsed = MemoryDeleteInput.parse(input);
  const existing = await redis.hgetall<Record<string, string>>(`memory:${parsed.id}`);

  if (!existing || !existing.content) {
    throw new Error(`Memory ${parsed.id} not found`);
  }
  if (existing.userId !== parsed.userId) {
    throw new Error("Not authorized to delete this memory");
  }

  await redis.del(`memory:${parsed.id}`);
  await redis.srem(`user:${parsed.userId}:memories`, parsed.id);

  const ns = vectorIndex.namespace(parsed.userId);
  await ns.delete(parsed.id);

  logger.info({ id: parsed.id }, "Memory deleted");

  return { id: parsed.id, deleted: true };
}