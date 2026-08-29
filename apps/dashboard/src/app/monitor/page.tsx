"use client";

import { useEffect, useRef, useState } from "react";
import type { McpEvent } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface LiveEvent extends McpEvent {
  key: string;
}

export default function MonitorPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const idCounter = useRef(0);

  useEffect(() => {
    const source = new EventSource(`${API_URL}/api/events/stream`);

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.onmessage = (e) => {
      try {
        const parsed: McpEvent = JSON.parse(e.data);
        idCounter.current += 1;
        setEvents((prev) => [{ ...parsed, key: `${parsed.timestamp}-${idCounter.current}` }, ...prev].slice(0, 100));
      } catch {
        // ignore malformed events
      }
    };

    return () => source.close();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Live Monitor
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-[var(--color-accent)]" : "bg-[var(--color-warning)]"
            }`}
          />
          <span className="text-[var(--color-text-muted)]">
            {connected ? "Connected" : "Connecting…"}
          </span>
        </div>
      </div>

      {events.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
          Waiting for tool calls… trigger something in the app (search, save a memory) to see it here live.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {events.map((e) => (
          <div
            key={e.key}
            className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm animate-[float_0s]"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                e.status === "success" ? "bg-[var(--color-accent)]" : "bg-[var(--color-warning)]"
              }`}
            />
            <span className="w-40 shrink-0 font-[family-name:var(--font-mono)] text-xs">
              {e.toolName}
            </span>
            <span
              className={`w-16 shrink-0 text-xs ${
                e.status === "success" ? "text-[var(--color-accent)]" : "text-[var(--color-warning)]"
              }`}
            >
              {e.status}
            </span>
            <span className="w-20 shrink-0 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
              {e.durationMs}ms
            </span>
            <span className="flex-1 truncate text-xs text-[var(--color-text-muted)]">
              {e.userId ?? "—"}
            </span>
            <span className="shrink-0 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
              {new Date(e.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}