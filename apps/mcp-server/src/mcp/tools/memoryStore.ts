import { randomUUID } from "node:crypto";
import { MemoryStoreInput, type MemoryStoreInputT } from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { vectorIndex } from "../../lib/vector.js";
import { logger } from "../../lib/logger.js";

export async function storeMemory(input: MemoryStoreInputT): Promise<{ id: string }> {
  const parsed = MemoryStoreInput.parse(input);
  const id = randomUUID();
  const now = Date.now();

  await redis.hset(`memory:${id}`, {
    content: parsed.content,
    userId: parsed.userId,
    tags: JSON.stringify(parsed.tags ?? []),
    source: "manual",
    createdAt: now,
    updatedAt: now,
  });

  await redis.sadd(`user:${parsed.userId}:memories`, id);

  const ns = vectorIndex.namespace(parsed.userId);
  await ns.upsert({
    id,
    data: parsed.content,
    metadata: {
      type: "memory",
      tags: parsed.tags ?? [],
      createdAt: now,
    },
  });

  logger.info({ id, userId: parsed.userId }, "Memory stored");

  return { id };
}