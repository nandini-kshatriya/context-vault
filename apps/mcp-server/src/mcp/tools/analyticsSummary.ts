import {
  AnalyticsSummaryInput,
  type AnalyticsSummaryInputT,
  type AnalyticsSummaryOutputT,
} from "@contextvault/schemas";
import { computeAnalytics } from "../../lib/analytics.js";

export async function analyticsSummary(
  input: AnalyticsSummaryInputT
): Promise<AnalyticsSummaryOutputT> {
  const parsed = AnalyticsSummaryInput.parse(input);
  const result = await computeAnalytics(parsed.userId, parsed.since);
  return {
    totalCalls: result.totalCalls,
    errorRate: result.errorRate,
    avgLatencyMs: result.avgLatencyMs,
    topTools: result.topTools,
  };
}