import { redis } from "./redis.js";

export interface DocumentSummary {
  id: string;
  title: string;
  userId: string;
  sourceUrl?: string;
  createdAt: number;
}

export async function listDocuments(userId: string): Promise<DocumentSummary[]> {
  const ids = await redis.smembers(`user:${userId}:documents`);

  const all = await Promise.all(
    ids.map(async (id) => {
      const hash = await redis.hgetall<Record<string, string>>(`document:${id}`);
      if (!hash || !hash.title) return null;
      return {
        id,
        title: hash.title,
        userId: hash.userId,
        sourceUrl: hash.sourceUrl || undefined,
        createdAt: Number(hash.createdAt),
      } as DocumentSummary;
    })
  );

  return all
    .filter((d): d is DocumentSummary => d !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}