import { z } from "zod";

export const AnalyticsSummaryInput = z.object({
  userId: z.string().optional(),
  since: z.number().optional(),
});

export const AnalyticsSummaryOutput = z.object({
  totalCalls: z.number(),
  errorRate: z.number(),
  avgLatencyMs: z.number(),
  topTools: z.array(
    z.object({
      toolName: z.string(),
      count: z.number(),
    })
  ),
});

export type AnalyticsSummaryInputT = z.infer<typeof AnalyticsSummaryInput>;
export type AnalyticsSummaryOutputT = z.infer<typeof AnalyticsSummaryOutput>;