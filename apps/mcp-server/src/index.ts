import { env } from "./lib/env.js";
import { redis } from "./lib/redis.js";
import { vectorIndex } from "./lib/vector.js";
import { logger } from "./lib/logger.js";

logger.info("Env loaded");
logger.info(`PORT: ${env.PORT}`);

const testKey = "contextvault:smoketest";
await redis.set(testKey, { hello: "world", ts: Date.now() });
const value = await redis.get(testKey);
logger.info({ value }, "Redis round-trip successful");
await redis.del(testKey);

await vectorIndex.upsert({
  id: "smoketest-1",
  data: "This is a test memory about coffee and mornings.",
  metadata: { type: "test" },
});

const results = await vectorIndex.query({
  data: "What do I drink in the morning?",
  topK: 1,
  includeMetadata: true,
});

logger.info({ results }, "Vector round-trip successful");

await vectorIndex.delete("smoketest-1");