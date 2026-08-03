import { z } from "zod";

export const McpEvent = z.object({
  toolName: z.string(),
  status: z.enum(["success", "error"]),
  durationMs: z.number(),
  userId: z.string().optional(),
  timestamp: z.number(),
  errorMessage: z.string().optional(),
});

export type McpEventT = z.infer<typeof McpEvent>;