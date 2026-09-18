import { getToolName, isToolUIPart, type UIMessage } from "ai";

export interface AgentMetrics {
  state: "waiting" | "streaming" | "complete" | "stopped" | "error";
  firstTextMs: number | null;
  elapsedMs: number;
  tokensPerSecond: number | null;
}

export function measureRequest(start: number, firstText: number | null, now: number, outputTokens?: number) {
  const elapsedMs = Math.max(0, now - start);
  return {
    firstTextMs: firstText === null ? null : Math.max(0, firstText - start),
    elapsedMs,
    tokensPerSecond: typeof outputTokens === "number" && Number.isFinite(outputTokens) && outputTokens >= 0 && elapsedMs > 0
      ? outputTokens * 1000 / elapsedMs : null,
  };
}

export function getToolTelemetry(parts: UIMessage["parts"], active: boolean) {
  return parts.filter(isToolUIPart).map((part) => {
    let failed = part.state === "output-error" || part.state === "output-denied";
    if (part.state === "output-available") {
      let output: unknown = part.output;
      if (typeof output === "string") {
        try { output = JSON.parse(output); } catch { /* Plain-text results are valid. */ }
      }
      failed = !!output && typeof output === "object" && "error" in output;
    }
    const state = failed ? "failed"
      : part.state === "output-available" ? "complete"
      : part.state === "approval-requested" ? "approval required"
      : !active ? "interrupted"
      : part.state === "input-streaming" ? "receiving input" : "running";
    return { id: part.toolCallId, name: getToolName(part), state };
  });
}
