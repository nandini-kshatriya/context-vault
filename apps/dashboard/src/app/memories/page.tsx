import Link from "next/link";
import { api } from "@/lib/api-client";

export default async function MemoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const params = await searchParams;
  const userId = params.userId || "test-user-1";

  let memories: Awaited<ReturnType<typeof api.listMemories>>["memories"] = [];
  let error: string | null = null;

  try {
    const result = await api.listMemories(userId);
    memories = result.memories;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load memories";
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Memories
        </h1>
        <form className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-text-muted)]">User</label>
          <input
            name="userId"
            defaultValue={userId}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-[family-name:var(--font-mono)] outline-none focus:border-[var(--color-accent)]"
          />
        </form>
      </div>

      {error && (
        <div className="rounded-md border border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-4 text-sm text-[var(--color-warning)]">
          {error}
        </div>
      )}

      {!error && memories.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
          No memories yet for this user.
        </div>
      )}

      {!error && memories.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface)] text-left text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-normal">Content</th>
                <th className="px-4 py-3 font-normal">Tags</th>
                <th className="px-4 py-3 font-normal">Created</th>
              </tr>
            </thead>
            <tbody>
              {memories.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/memories/${m.id}?userId=${encodeURIComponent(userId)}`}
                      className="hover:text-[var(--color-accent)]"
                    >
                      {m.content.length > 80 ? m.content.slice(0, 80) + "…" : m.content}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.metadata.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--color-violet)]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-violet)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                    {new Date(m.metadata.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}