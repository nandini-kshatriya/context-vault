import { redis } from "./redis.js";
import { parseTags } from "./parseTags.js";
import type { MemoryT } from "@contextvault/schemas";

export async function listMemories(
  userId: string,
  page = 1,
  pageSize = 20
): Promise<{ memories: MemoryT[]; total: number; page: number; pageSize: number }> {
  const ids = await redis.smembers(`user:${userId}:memories`);

  const all = await Promise.all(
    ids.map(async (id) => {
      const hash = await redis.hgetall<Record<string, string>>(`memory:${id}`);
      if (!hash || !hash.content) return null;
      return {
        id,
        content: hash.content,
        metadata: {
          userId: hash.userId,
          tags: parseTags(hash.tags),
          source: hash.source as "manual" | "agent" | "import",
          createdAt: Number(hash.createdAt),
          updatedAt: Number(hash.updatedAt),
        },
      } as MemoryT;
    })
  );

  const sorted = all
    .filter((m): m is MemoryT => m !== null)
    .sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);

  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  return { memories: paged, total: sorted.length, page, pageSize };
}