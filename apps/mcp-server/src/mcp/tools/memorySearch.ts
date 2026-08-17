import { MemorySearchInput, type MemorySearchInputT, type MemoryT } from "@contextvault/schemas";
import { redis } from "../../lib/redis.js";
import { vectorIndex } from "../../lib/vector.js";
import { logger } from "../../lib/logger.js";
import { parseTags } from "../../lib/parseTags.js";

export async function searchMemories(input: MemorySearchInputT): Promise<(MemoryT & { score: number })[]> {
  const parsed = MemorySearchInput.parse(input);
  const ns = vectorIndex.namespace(parsed.userId);

  let filter = "type = 'memory'";
  if (parsed.tags && parsed.tags.length > 0) {
    const tagConditions = parsed.tags.map((t) => `tags CONTAINS '${t}'`).join(" OR ");
    filter += ` AND (${tagConditions})`;
  }

  const results = await ns.query({
    data: parsed.query,
    topK: parsed.topK,
    includeMetadata: true,
    filter,
  });

  const hydrated = await Promise.all(
    results.map(async (r) => {
      const hash = await redis.hgetall<Record<string, string>>(`memory:${r.id}`);
      if (!hash || !hash.content) return null;
      return {
        id: String(r.id),
        content: hash.content,
        metadata: {
          userId: hash.userId,
          tags: parseTags(hash.tags),
          source: hash.source as "manual" | "agent" | "import",
          createdAt: Number(hash.createdAt),
          updatedAt: Number(hash.updatedAt),
        },
        score: r.score,
      };
    })
  );

  logger.info({ userId: parsed.userId, count: hydrated.length }, "Memory search complete");

  return hydrated.filter((m): m is NonNullable<typeof m> => m !== null);
}