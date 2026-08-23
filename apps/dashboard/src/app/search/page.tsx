"use client";

import { useState } from "react";
import { api, type MemorySearchResult } from "@/lib/api-client";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("test-user-1");
  const [results, setResults] = useState<MemorySearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.searchMemories(query, userId, 10);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold">
        Search Playground
      </h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something semantically related to a memory…"
          className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-40 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-[family-name:var(--font-mono)] outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-md border border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-3 text-sm text-[var(--color-warning)]">
          {error}
        </div>
      )}

      {results && results.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
          No matches found.
        </div>
      )}

      {results && results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-accent)]">
                  {(r.score * 100).toFixed(1)}% match
                </span>
                <div className="flex gap-1">
                  {r.metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--color-violet)]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-violet)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}