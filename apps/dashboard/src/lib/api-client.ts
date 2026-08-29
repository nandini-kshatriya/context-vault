const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface MemoryMetadata {
  userId: string;
  tags: string[];
  source: "manual" | "agent" | "import";
  createdAt: number;
  updatedAt: number;
}

export interface Memory {
  id: string;
  content: string;
  metadata: MemoryMetadata;
}

export interface MemorySearchResult extends Memory {
  score: number;
}

export interface DocumentSummary {
  id: string;
  title: string;
  userId: string;
  sourceUrl?: string;
  createdAt: number;
}

export interface ContextSource {
  type: "memory" | "document_chunk";
  id: string;
  score: number;
}

export interface ContextBuildResult {
  contextBlock: string;
  sources: ContextSource[];
}

export interface McpEvent {
  toolName: string;
  status: "success" | "error";
  durationMs: number;
  userId?: string;
  timestamp: number;
  errorMessage?: string;
}

export interface AnalyticsData {
  totalCalls: number;
  errorRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  topTools: { toolName: string; count: number }[];
  callsOverTime: { bucket: string; count: number }[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listMemories: (userId: string, page = 1, pageSize = 20) =>
    request<{ memories: Memory[]; total: number; page: number; pageSize: number }>(
      `/api/memories?userId=${encodeURIComponent(userId)}&page=${page}&pageSize=${pageSize}`
    ),

  getMemory: (id: string, userId: string) =>
    request<Memory>(`/api/memories/${id}?userId=${encodeURIComponent(userId)}`),

  updateMemory: (id: string, userId: string, updates: { content?: string; tags?: string[] }) =>
    request<{ id: string; updated: true }>(`/api/memories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ userId, ...updates }),
    }),

  deleteMemory: (id: string, userId: string) =>
    request<{ id: string; deleted: true }>(`/api/memories/${id}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),

  searchMemories: (query: string, userId: string, topK = 5) =>
    request<MemorySearchResult[]>(`/api/search`, {
      method: "POST",
      body: JSON.stringify({ query, userId, topK }),
    }),

  listDocuments: (userId: string) =>
    request<DocumentSummary[]>(`/api/documents?userId=${encodeURIComponent(userId)}`),

  ingestDocument: (title: string, userId: string, content: string, sourceUrl?: string) =>
    request<{ documentId: string; chunkCount: number }>(`/api/documents`, {
      method: "POST",
      body: JSON.stringify({ title, userId, content, sourceUrl }),
    }),

  buildContext: (query: string, userId: string, maxItems = 8) =>
    request<ContextBuildResult>(`/api/context`, {
      method: "POST",
      body: JSON.stringify({ query, userId, maxItems }),
    }),

  getAnalytics: (userId?: string) =>
    request<AnalyticsData>(`/api/analytics${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`),
};