import { randomBytes, createHash } from "node:crypto";
import { redis } from "./redis.js";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function generateApiKey(userId: string): Promise<string> {
  const rawKey = `cv_${randomBytes(24).toString("hex")}`;
  const hash = hashKey(rawKey);

  await redis.hset(`apikey:${hash}`, {
    userId,
    createdAt: Date.now(),
  });

  return rawKey; // shown to the caller once; only the hash is ever stored
}

export async function verifyApiKey(rawKey: string): Promise<{ userId: string } | null> {
  const hash = hashKey(rawKey);
  const record = await redis.hgetall<Record<string, string>>(`apikey:${hash}`);
  if (!record || !record.userId) return null;
  return { userId: record.userId };
}