import { z } from "zod";

export const MemoryMetadata = z.object({
  userId: z.string(),
  tags: z.array(z.string()).default([]),
  source: z.enum(["manual", "agent", "import"]).default("manual"),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const Memory = z.object({
  id: z.string(),
  content: z.string().min(1).max(8000),
  metadata: MemoryMetadata,
});

export const MemoryStoreInput = z.object({
  content: z.string().min(1).max(8000),
  userId: z.string(),
  tags: z.array(z.string()).optional(),
});

export const MemorySearchInput = z.object({
  query: z.string().min(1),
  userId: z.string(),
  topK: z.number().int().min(1).max(20).default(5),
  tags: z.array(z.string()).optional(),
});

export const MemoryRetrieveInput = z.object({
  id: z.string(),
  userId: z.string(),
});

export const MemoryUpdateInput = z.object({
  id: z.string(),
  userId: z.string(),
  content: z.string().min(1).max(8000).optional(),
  tags: z.array(z.string()).optional(),
});

export const MemoryDeleteInput = z.object({
  id: z.string(),
  userId: z.string(),
});

export type MemoryMetadataT = z.infer<typeof MemoryMetadata>;
export type MemoryT = z.infer<typeof Memory>;
export type MemoryStoreInputT = z.infer<typeof MemoryStoreInput>;
export type MemorySearchInputT = z.infer<typeof MemorySearchInput>;
export type MemoryRetrieveInputT = z.infer<typeof MemoryRetrieveInput>;
export type MemoryUpdateInputT = z.infer<typeof MemoryUpdateInput>;
export type MemoryDeleteInputT = z.infer<typeof MemoryDeleteInput>;