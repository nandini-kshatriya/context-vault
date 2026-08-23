import { Hono } from "hono";
import { computeAnalytics } from "../../lib/analytics.js";
import { logger } from "../../lib/logger.js";

const analytics = new Hono();

analytics.get("/", async (c) => {
  const userId = c.req.query("userId") || undefined;
  const sinceStr = c.req.query("since");
  const since = sinceStr ? Number(sinceStr) : undefined;

  try {
    const result = await computeAnalytics(userId, since);
    return c.json(result);
  } catch (err) {
    logger.error({ err }, "GET /api/analytics failed");
    return c.json({ error: "Failed to compute analytics" }, 500);
  }
});

export default analytics;