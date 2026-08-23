import { emitEvent } from "./events.js";
import { logger } from "./logger.js";

/**
 * Wraps a REST handler function so its call is logged to the same
 * mcp:events stream as MCP tool calls — keeping the Live Monitor and
 * Analytics pages accurate regardless of whether a request came through
 * the MCP protocol or the REST API.
 */
export async function withEvent<T>(
  toolName: string,
  userId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    await emitEvent({
      toolName,
      status: "success",
      durationMs: Date.now() - start,
      userId,
      timestamp: Date.now(),
    });
    return result;
  } catch (err) {
    await emitEvent({
      toolName,
      status: "error",
      durationMs: Date.now() - start,
      userId,
      timestamp: Date.now(),
      errorMessage: String(err),
    });
    logger.error({ err }, `${toolName} (via REST) failed`);
    throw err;
  }
}