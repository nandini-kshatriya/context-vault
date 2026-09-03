"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api, type AnalyticsData } from "@/lib/api-client";

const PIE_COLORS = ["#a78bfa", "#8b7fd8", "#c4b5fd", "#f0b429", "#6d5fc4"];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-1 font-[family-name:var(--font-mono)] text-2xl">{value}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [userId, setUserId] = useState("test-user-1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getAnalytics(userId || undefined)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [userId]);

  const chartData = (data?.callsOverTime ?? []).map((d) => ({
    time: new Date(d.bucket).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    count: d.count,
  }));

  const latencyData = data
    ? [
        { name: "avg", ms: Math.round(data.avgLatencyMs) },
        { name: "p50", ms: data.p50LatencyMs },
        { name: "p95", ms: data.p95LatencyMs },
      ]
    : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Analytics
        </h1>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="userId (blank = all users)"
          className="w-56 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-[family-name:var(--font-mono)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-3 text-sm text-[var(--color-warning)]">
          {error}
        </div>
      )}

      {loading && <div className="text-[var(--color-text-muted)]">Loading…</div>}

      {data && !loading && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Calls" value={String(data.totalCalls)} />
            <StatCard label="Error Rate" value={`${(data.errorRate * 100).toFixed(1)}%`} />
            <StatCard label="Avg Latency" value={`${Math.round(data.avgLatencyMs)}ms`} />
            <StatCard label="p95 Latency" value={`${data.p95LatencyMs}ms`} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h2 className="mb-4 text-sm text-[var(--color-text-muted)]">Calls over time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h2 className="mb-4 text-sm text-[var(--color-text-muted)]">Latency (ms)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="ms" fill="var(--color-violet)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:col-span-2">
              <h2 className="mb-4 text-sm text-[var(--color-text-muted)]">Tool usage</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.topTools}
                    dataKey="count"
                    nameKey="toolName"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry: any) => entry.toolName ?? ""}
                  >
                    {data.topTools.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}