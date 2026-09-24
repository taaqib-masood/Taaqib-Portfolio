"use client";

import { Terminal } from "lucide-react";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { TokenText } from "@/components/TokenText";

// Mirrors the keys of `tools` in src/lib/tools.ts (not imported: that module is server-only).
const TOOLS = ["get_project", "get_resume_section", "get_github_stats", "get_live_demo"];

const CLIENT = { x: 40, y: 220, w: 220, h: 120 };
const SERVER = { x: 420, y: 200, w: 240, h: 160 };
const TOOL_X = 900;
const toolY = (i: number) => 60 + i * 140;
const toolPath = (i: number) => {
  const sx = SERVER.x + SERVER.w, sy = SERVER.y + SERVER.h / 2, ty = toolY(i) + 24;
  return `M ${sx} ${sy} C ${sx + 120} ${sy}, ${TOOL_X - 120} ${ty}, ${TOOL_X} ${ty}`;
};
const clientPath = `M ${CLIENT.x + CLIENT.w} ${CLIENT.y + CLIENT.h / 2} L ${SERVER.x} ${SERVER.y + SERVER.h / 2}`;

export function McpTeaser() {
  const handleWakeUp = () => {
    window.dispatchEvent(new CustomEvent("wakeUpAgent", { detail: "Access Neural Web" }));
    document.getElementById("agent")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="mcp-teaser" className="max-w-[1440px] mx-auto border-b border-border bg-foreground text-background relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 border-b border-background overflow-hidden">
        <ParallaxNumber number="04" />
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-background">
          <h2 className="relative z-10 text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]"><TokenText text="Tool Graph" /></h2>
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 flex items-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#3a3c4e]">
            The tools the agent above can call · {TOOLS.length} tools · up to 4 steps per answer
          </p>
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-end gap-8 border-b lg:border-b-0 lg:border-r border-background">
          <p className="text-[16px] md:text-[18px] leading-[1.5] text-[#1a1c1c]">
            When the agent needs a fact it doesn&apos;t already hold, it fetches it through one of these
            calls, and the trace under the chat shows each call as it runs. It&apos;s the same pattern as the
            MCP code-review pipeline, only small enough to watch.
          </p>
          <button
            onClick={handleWakeUp}
            className="group flex items-center justify-between gap-6 border border-background bg-transparent px-6 min-h-[52px] text-[14px] font-bold uppercase tracking-widest transition-colors hover:bg-background hover:text-foreground w-fit"
          >
            <span className="flex items-center gap-3"><Terminal className="h-5 w-5" />Wake Up Agent</span>
          </button>
        </div>

        {/* Desktop: animated topology */}
        <div className="hidden md:block lg:col-span-8 p-8">
          <svg viewBox="0 0 1220 600" className="w-full h-auto" role="img" aria-label={`Agent terminal calls a tool registry with ${TOOLS.length} tools: ${TOOLS.join(", ")}`}>
            <path d={clientPath} stroke="#000" strokeWidth="1.5" fill="none" />
            {TOOLS.map((_, i) => <path key={i} d={toolPath(i)} stroke="#000" strokeWidth="1" fill="none" />)}
            <g className="motion-reduce:hidden">
              <rect width="10" height="10" x="-5" y="-5" fill="#2e5bff">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={clientPath} />
              </rect>
              {TOOLS.map((_, i) => (
                <rect key={i} width="8" height="8" x="-4" y="-4" fill="#2e5bff">
                  <animateMotion dur={`${2 + i * 0.4}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" path={toolPath(i)} />
                </rect>
              ))}
            </g>

            <rect x={CLIENT.x} y={CLIENT.y} width={CLIENT.w} height={CLIENT.h} fill="#000" />
            <text x={CLIENT.x + 16} y={CLIENT.y + 28} fill="#a3a6b6" fontSize="12" fontFamily="ui-monospace, monospace" letterSpacing="2">CLIENT</text>
            <text x={CLIENT.x + 16} y={CLIENT.y + CLIENT.h - 20} fill="#fff" fontSize="20" fontWeight="700">AGENT TERMINAL</text>

            <rect x={SERVER.x} y={SERVER.y} width={SERVER.w} height={SERVER.h} fill="#2e5bff" />
            <text x={SERVER.x + 16} y={SERVER.y + 28} fill="#fff" fontSize="12" fontFamily="ui-monospace, monospace" letterSpacing="2">SERVER</text>
            <text x={SERVER.x + 16} y={SERVER.y + SERVER.h - 44} fill="#fff" fontSize="20" fontWeight="700">TOOL REGISTRY</text>
            <text x={SERVER.x + 16} y={SERVER.y + SERVER.h - 20} fill="#fff" fontSize="12" fontFamily="ui-monospace, monospace">streamText · /api/chat/stream</text>

            {TOOLS.map((t, i) => (
              <g key={t}>
                <rect x={TOOL_X} y={toolY(i)} width="300" height="48" fill="#fff" stroke="#000" />
                <text x={TOOL_X + 16} y={toolY(i) + 30} fill="#000" fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">{t}()</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Mobile: the same graph as a list */}
        <ol className="md:hidden p-6 font-mono text-[13px] space-y-2">
          <li className="bg-background text-foreground px-4 py-3">AGENT TERMINAL</li>
          <li className="bg-primary text-foreground px-4 py-3">↓ TOOL REGISTRY</li>
          {TOOLS.map((t) => <li key={t} className="border border-background px-4 py-3">↳ {t}()</li>)}
        </ol>
      </div>
    </section>
  );
}
