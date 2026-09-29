"use client";

import { useRef } from "react";
import type { getToolTelemetry } from "@/lib/agent-telemetry";

type Tool = ReturnType<typeof getToolTelemetry>[number];
type Timing = { start: number; firstText: number | null; end: number | null };
const DONE = new Set(["complete", "failed", "interrupted"]);

/**
 * Live span waterfall for the latest request: request → tool calls → first text → stream.
 * Tool spans are browser-observed (first seen → settled), the same clock as the status bar.
 */
export function AgentTrace({ timing, tools, isLoading }: { timing: Timing; tools: Tool[]; isLoading: boolean }) {
  const spans = useRef<{ start: number; map: Map<string, { from: number; to: number | null }> }>({ start: 0, map: new Map() });
  if (spans.current.start !== timing.start) spans.current = { start: timing.start, map: new Map() };

  const now = performance.now() - timing.start;
  for (const t of tools) {
    const s = spans.current.map.get(t.id) ?? { from: now, to: null };
    if (s.to === null && DONE.has(t.state)) s.to = now;
    spans.current.map.set(t.id, s);
  }

  const end = timing.end !== null ? timing.end - timing.start : now;
  const total = Math.max(end, 1);
  const firstText = timing.firstText === null ? null : timing.firstText - timing.start;
  const pct = (ms: number) => `${Math.min(100, (ms / total) * 100)}%`;

  const rows = [
    { key: "request", label: "POST /api/chat/stream", from: 0, to: end, tone: "bg-surface" },
    ...tools.map((t) => {
      const s = spans.current.map.get(t.id)!;
      return {
        key: t.id,
        label: `▸ ${t.name}()`,
        from: s.from,
        to: s.to ?? end,
        tone: t.state === "failed" ? "bg-destructive" : s.to === null ? "bg-primary animate-pulse" : "bg-surface/50",
      };
    }),
    ...(firstText !== null ? [{ key: "stream", label: "stream", from: firstText, to: end, tone: "bg-primary" }] : []),
  ];

  return (
    <div aria-label="Request trace" className="border-t border-surface/20 px-6 py-4 font-mono text-[11px] uppercase tracking-wider">
      <div className="flex justify-between text-surface/50 mb-2">
        <span>Trace · {isLoading ? "live" : "last request"}</span>
        <span>{firstText !== null ? `first text ${Math.round(firstText)}ms · ` : ""}{(end / 1000).toFixed(2)}s</span>
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.key} className="grid grid-cols-[minmax(0,220px)_1fr_64px] items-center gap-3">
            <span className="truncate text-surface/80">{r.label}</span>
            <span className="relative h-2.5 border-x border-surface/15">
              <span className={`absolute inset-y-0 ${r.tone}`} style={{ left: pct(r.from), width: `max(3px, ${pct(r.to - r.from)})` }} />
              {firstText !== null && <span className="absolute -inset-y-1 w-px bg-primary" style={{ left: pct(firstText) }} />}
            </span>
            <span className="text-right text-surface/60">{Math.round(r.to - r.from)}ms</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
