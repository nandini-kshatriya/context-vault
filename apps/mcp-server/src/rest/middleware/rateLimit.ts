import type { MiddlewareHandler } from "hono";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../lib/redis.js";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"), // 30 requests per 10 seconds per key
  analytics: true,
  prefix: "ratelimit",
});

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const key = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : c.req.header("x-forwarded-for") ?? "anonymous";

  const { success, limit, remaining, reset } = await ratelimit.limit(key);

  c.header("X-RateLimit-Limit", String(limit));
  c.header("X-RateLimit-Remaining", String(remaining));
  c.header("X-RateLimit-Reset", String(reset));

  if (!success) {
    return c.json({ error: "Rate limit exceeded. Try again shortly." }, 429);
  }

  await next();
};