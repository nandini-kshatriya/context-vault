import { McpEvent, type McpEventT } from "@contextvault/schemas";
import { redis } from "./redis.js";
import { logger } from "./logger.js";

const STREAM_KEY = "mcp:events";

export async function emitEvent(event: McpEventT): Promise<void> {
  try {
    const parsed = McpEvent.parse(event);
    await redis.xadd(STREAM_KEY, "*", { payload: parsed });
  } catch (err) {
    // Never let a logging failure break the actual tool call.
    logger.error({ err }, "Failed to emit event to stream");
  }
}