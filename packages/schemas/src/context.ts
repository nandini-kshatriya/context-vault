import { z } from "zod";

export const ContextBuildInput = z.object({
  query: z.string(),
  userId: z.string(),
  maxItems: z.number().int().min(1).max(20).default(8),
});

export const ContextBuildOutput = z.object({
  contextBlock: z.string(),
  sources: z.array(
    z.object({
      type: z.enum(["memory", "document_chunk"]),
      id: z.string(),
      score: z.number(),
    })
  ),
});

export type ContextBuildInputT = z.infer<typeof ContextBuildInput>;
export type ContextBuildOutputT = z.infer<typeof ContextBuildOutput>;