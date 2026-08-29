import type { MiddlewareHandler } from "hono";
import { verifyApiKey } from "../../lib/apiKeys.js";
import { env } from "../../lib/env.js";

/**
 * Requires a valid `Authorization: Bearer <key>` header on every /api/* route.
 * In development, requests are allowed through without a key so local dashboard
 * testing keeps working without extra setup — this must be tightened before
 * any real deployment (see README "Security" section).
 */
export const requireApiKey: MiddlewareHandler = async (c, next) => {
  if (env.NODE_ENV === "development") {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  const key = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!key) {
    return c.json({ error: "Missing API key" }, 401);
  }

  const result = await verifyApiKey(key);
  if (!result) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  c.set("authUserId", result.userId);
  await next();
};