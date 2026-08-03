import { z } from "zod";

export const DocumentChunk = z.object({
  id: z.string(),
  documentId: z.string(),
  chunkIndex: z.number(),
  content: z.string(),
});

export const DocumentIngestInput = z.object({
  title: z.string(),
  userId: z.string(),
  content: z.string().min(1),
  sourceUrl: z.string().url().optional(),
});

export const DocumentSearchInput = z.object({
  query: z.string().min(1),
  userId: z.string(),
  topK: z.number().int().min(1).max(20).default(5),
});

export type DocumentChunkT = z.infer<typeof DocumentChunk>;
export type DocumentIngestInputT = z.infer<typeof DocumentIngestInput>;
export type DocumentSearchInputT = z.infer<typeof DocumentSearchInput>;