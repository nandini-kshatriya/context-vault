import { redis } from "./redis.js";
import type { McpEventT } from "@contextvault/schemas";

export interface AnalyticsDetail {
  totalCalls: number;
  errorRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  topTools: { toolName: string; count: number }[];
  callsOverTime: { bucket: string; count: number }[];
}

export async function computeAnalytics(
  userId?: string,
  sinceMs?: number
): Promise<AnalyticsDetail> {
  const entries = await redis.xrange("mcp:events", "-", "+");
  const events: McpEventT[] = [];

  for (const [, fields] of Object.entries(entries ?? {})) {
    const payload = (fields as Record<string, unknown>).payload;
    if (!payload) continue;
    const parsed: McpEventT =
      typeof payload === "string" ? JSON.parse(payload) : (payload as McpEventT);
    if (userId && parsed.userId !== userId) continue;
    if (sinceMs && parsed.timestamp < sinceMs) continue;
    events.push(parsed);
  }

  const totalCalls = events.length;
  const errorCount = events.filter((e) => e.status === "error").length;
  const errorRate = totalCalls > 0 ? errorCount / totalCalls : 0;

  const durations = events.map((e) => e.durationMs).sort((a, b) => a - b);
  const avgLatencyMs =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  const percentile = (p: number) => {
    if (durations.length === 0) return 0;
    const idx = Math.min(durations.length - 1, Math.floor((p / 100) * durations.length));
    return durations[idx];
  };

  const toolCounts = new Map<string, number>();
  for (const e of events) {
    toolCounts.set(e.toolName, (toolCounts.get(e.toolName) ?? 0) + 1);
  }
  const topTools = [...toolCounts.entries()]
    .map(([toolName, count]) => ({ toolName, count }))
    .sort((a, b) => b.count - a.count);

  const bucketMap = new Map<string, number>();
  for (const e of events) {
    const d = new Date(e.timestamp);
    d.setSeconds(0, 0);
    d.setMinutes(Math.floor(d.getMinutes() / 5) * 5);
    const bucket = d.toISOString();
    bucketMap.set(bucket, (bucketMap.get(bucket) ?? 0) + 1);
  }
  const callsOverTime = [...bucketMap.entries()]
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));

  return { totalCalls, errorRate, avgLatencyMs, p50LatencyMs: percentile(50), p95LatencyMs: percentile(95), topTools, callsOverTime };
}