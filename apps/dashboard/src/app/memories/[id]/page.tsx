"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, type Memory } from "@/lib/api-client";

export default function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId") || "test-user-1";

  const [memory, setMemory] = useState<Memory | null>(null);
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMemory(id, userId)
      .then((m) => {
        setMemory(m);
        setContent(m.content);
        setTagsInput(m.metadata.tags.join(", "));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id, userId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api.updateMemory(id, userId, { content, tags });
      router.push(`/memories?userId=${encodeURIComponent(userId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this memory? This cannot be undone.")) return;
    try {
      await api.deleteMemory(id, userId);
      router.push(`/memories?userId=${encodeURIComponent(userId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) {
    return <div className="text-[var(--color-text-muted)]">Loading…</div>;
  }

  if (error && !memory) {
    return (
      <div className="rounded-md border border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-4 text-sm text-[var(--color-warning)]">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold">
        Edit Memory
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-3 text-sm text-[var(--color-warning)]">
          {error}
        </div>
      )}

      <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Content</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="mb-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-accent)]"
      />

      <label className="mb-1 block text-sm text-[var(--color-text-muted)]">
        Tags (comma-separated)
      </label>
      <input
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        className="mb-6 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm font-[family-name:var(--font-mono)] outline-none focus:border-[var(--color-accent)]"
      />

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={handleDelete}
          className="rounded-md border border-[var(--color-warning)] px-4 py-2 text-sm font-medium text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10"
        >
          Delete
        </button>
      </div>

      {memory && (
        <div className="mt-8 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
          <div className="font-[family-name:var(--font-mono)]">id: {memory.id}</div>
          <div className="font-[family-name:var(--font-mono)]">
            created: {new Date(memory.metadata.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}