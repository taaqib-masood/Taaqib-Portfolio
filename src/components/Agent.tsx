"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Wrench, Copy, Check, Sparkles, Terminal, Layers, Award, UserCheck } from "lucide-react";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { VerticalLine } from "@/components/VerticalLine";

export type InterviewMode = "general" | "architecture" | "star" | "recruiter";

interface ModeOption {
  id: InterviewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  description: string;
  promptSuggestions: string[];
}

const INTERVIEW_MODES: ModeOption[] = [
  {
    id: "general",
    label: "ALL-ROUND PROXY",
    icon: Terminal,
    badge: "HYBRID",
    description: "Full technical overview, projects, and bio as Taaqib's engineering proxy.",
    promptSuggestions: [
      "Tell me about Reva AI — WhatsApp Receptionist",
      "What did you build at LTTS?",
      "Walk me through your resume / background",
      "What open-source repositories do you maintain?",
    ],
  },
  {
    id: "architecture",
    label: "SYSTEM DESIGN",
    icon: Layers,
    badge: "L4 / L5",
    description: "Deep architecture trade-offs, schemas, solvePnP math, and WebRTC SFU scale.",
    promptSuggestions: [
      "Why LiveKit WebRTC instead of a peer-to-peer mesh at LTTS?",
      "How did you achieve <50ms MediaPipe solvePnP gaze tracking?",
      "Explain Reva AI's WhatsApp state machine and multi-tenant RLS",
      "How does your MCP Code Review pipeline catch RCE and SQLi?",
    ],
  },
  {
    id: "star",
    label: "STAR STORIES",
    icon: Award,
    badge: "BEHAVIORAL",
    description: "Situation, Task, Action, and Measurable Result with real production metrics.",
    promptSuggestions: [
      "Tell me about a tough production bug you diagnosed and fixed",
      "How did you handle false-positive alerts in the proctoring platform?",
      "Describe a time you had to deliver under tight engineering deadlines",
      "How do you approach code quality vs shipping speed?",
    ],
  },
  {
    id: "recruiter",
    label: "RECRUITER SCREEN",
    icon: UserCheck,
    badge: "FAST TRACK",
    description: "Crisp, high-signal highlights: tech stack, location, visa, and availability.",
    promptSuggestions: [
      "Walk me through your background and strongest skills",
      "Are you immediately available in Dubai, UAE?",
      "What roles and domains are you targeting?",
      "Do you have a valid UAE driving license?",
    ],
  },
];

const SUGGESTED_PROMPTS = [
  "Tell me about Reva AI — WhatsApp Receptionist",
  "What did you build at LTTS?",
  "Walk me through your resume / background",
  "Tell me about a tough engineering challenge",
];

const TOOL_LABELS: Record<string, string> = {
  get_project: "get_project",
  get_resume_section: "get_resume_section",
  get_github_stats: "get_github_stats",
  get_live_demo: "get_live_demo",
};

type AnyPart = { type: string; text?: string; toolInvocation?: { toolName: string } };

function getTextFromParts(parts: AnyPart[] | undefined, content: string | undefined): string {
  if (!parts || parts.length === 0) return content ?? "";
  return parts
    .filter((p: AnyPart) => p.type === "text")
    .map((p: AnyPart) => p.text as string)
    .join("");
}

function getToolsFromParts(parts: AnyPart[] | undefined): string[] {
  if (!parts) return [];
  const names = new Set<string>();
  for (const part of parts) {
    if (
      (part.type === "tool-invocation" || part.type === "tool-call") &&
      typeof part.toolInvocation?.toolName === "string"
    ) {
      names.add(part.toolInvocation.toolName as string);
    }
  }
  return Array.from(names);
}

// Heuristic to generate contextual follow-ups after an assistant message
function getContextualFollowUps(text: string, currentMode: InterviewMode): string[] {
  const lower = text.toLowerCase();
  if (lower.includes("reva") || lower.includes("whatsapp") || lower.includes("receptionist")) {
    return [
      "How did you structure the Supabase RLS policies?",
      "Walk me through the WhatsApp state-machine",
      "What was the tech stack and Razorpay payment flow?",
    ];
  }
  if (lower.includes("proctoring") || lower.includes("ltts") || lower.includes("gaze") || lower.includes("livekit")) {
    return [
      "Why LiveKit SFU over WebRTC mesh?",
      "How did you calibrate MediaPipe solvePnP gaze tracking?",
      "Tell me about false positives in the proctoring engine",
    ];
  }
  if (lower.includes("mcp") || lower.includes("code review") || lower.includes("claude")) {
    return [
      "How did the MCP pipeline verify Jira acceptance criteria?",
      "What critical vulnerabilities did Claude 3.5 catch?",
      "How would you scale this across 100 repositories?",
    ];
  }
  if (lower.includes("github") || lower.includes("graphify") || lower.includes("ponytail")) {
    return [
      "Tell me about Graphify and AST knowledge graphs",
      "How does Ponytail enforce lazy-senior-dev YAGNI rules?",
      "What ML models power your stock market forecasting repo?",
    ];
  }
  if (currentMode === "recruiter") {
    return [
      "What are your top 3 engineering achievements?",
      "Tell me about your experience with AI Agents and MCP",
      "Are you available for immediate start in Dubai?",
    ];
  }
  return [
    "Tell me about the hardest bug you solved at LTTS",
    "How do you test and evaluate LLM agent outputs?",
    "Show me your GitHub open-source contributions",
  ];
}

export function Agent({ prefillMessage }: { prefillMessage?: string | null }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<InterviewMode>("general");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/stream",
        headers: () => ({
          "x-interview-mode": activeMode,
        }),
      }),
    [activeMode]
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (err: Error) => {
      console.error("Agent error details:", err);
      setApiError("Terminal connection interrupted. Check GROQ_API_KEY in environment variables.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      if (!streamStartTime) {
        setStreamStartTime(Date.now());
      }
      interval = setInterval(() => {
        if (streamStartTime) {
          setElapsedMs(Date.now() - streamStartTime);
        }
      }, 50);
    } else {
      setStreamStartTime(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, streamStartTime]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [inputValue]);

  useEffect(() => {
    if (prefillMessage) {
      setInputValue(prefillMessage);
      textareaRef.current?.focus();
    }
  }, [prefillMessage]);

  const submitMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setApiError(null);
      setStreamStartTime(Date.now());
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: trimmed }],
      });
      setInputValue("");
    },
    [isLoading, sendMessage]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage(inputValue);
    }
  };

  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      submitMessage(prompt);
    },
    [submitMessage]
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeModeConfig = INTERVIEW_MODES.find((m) => m.id === activeMode)!;

  const lastAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") return messages[i];
    }
    return null;
  }, [messages]);

  const followUpSuggestions = useMemo(() => {
    if (!lastAssistantMessage || isLoading) return [];
    const msgAny = lastAssistantMessage as { parts?: AnyPart[]; content?: string };
    const text = getTextFromParts(msgAny.parts, msgAny.content);
    return getContextualFollowUps(text, activeMode);
  }, [lastAssistantMessage, isLoading, activeMode]);

  return (
    <section id="agent" className="max-w-[1440px] mx-auto border-b border-surface/20 bg-foreground text-surface">
      {/* Header */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 border-b border-surface/20 overflow-hidden z-0">
        <ParallaxNumber number="05" />
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 relative flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              AI Proxy Ready · Groq LPU™
            </span>
          </div>
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] relative z-10">
            Agent Terminal
          </h2>
          <VerticalLine className="bg-surface/20" />
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface/5 flex flex-col justify-center">
          <p className="text-[15px] md:text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-surface/70">
            Technical Interview Proxy. Interview Taaqib Masood on system architecture, code challenges, STAR stories, and recruiter fit with sub-250ms streaming.
          </p>
        </div>
      </div>

      {/* Mode Selector Ribbon */}
      <div className="border-b border-surface/20 bg-surface/5 px-4 md:px-8 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-surface/60">
            <Sparkles className="h-3.5 w-3.5 text-surface/80" />
            <span>Interview Mode:</span>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 w-full md:w-auto">
            {INTERVIEW_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold border transition-all ${
                    isActive
                      ? "bg-surface text-foreground border-surface shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                      : "bg-transparent text-surface/70 border-surface/20 hover:border-surface/50 hover:text-surface"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{mode.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 border ${
                      isActive ? "border-foreground/30 text-foreground" : "border-surface/20 text-surface/50"
                    }`}
                  >
                    {mode.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Info Panel */}
        <div className="lg:col-span-4 border-b lg:border-b-0 relative flex flex-col">
          <VerticalLine className="bg-surface/20" />
          <div className="p-6 md:p-8 border-b border-surface/20 bg-foreground flex-1">
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-surface/50 block mb-1">
                Current Lens
              </span>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.05em] text-surface">
                {activeModeConfig.label}
              </h3>
              <p className="text-[13px] leading-[1.5] text-surface/60 mt-1">
                {activeModeConfig.description}
              </p>
            </div>

            <div className="pt-6 border-t border-surface/20">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest mb-4 text-surface/80">
                Performance & Architecture
              </h3>
              <ul className="space-y-3 text-[13px] leading-[1.5] text-surface/60 font-mono">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>
                    Inference: <strong className="text-surface">Groq LPU™ Engine</strong> (sub-250ms TTFT)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>
                    Context: <strong className="text-surface">Zero-Latency Grounded</strong> (all 6 projects & 10 repos)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>
                    Runtime: <strong className="text-surface">Next.js Edge Streaming</strong>
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-surface/20">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest mb-3 text-surface/80">
                Registered Tools
              </h3>
              <div className="flex flex-col gap-1.5">
                {Object.keys(TOOL_LABELS).map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 border border-surface/15 bg-surface/5 px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-surface/70"
                  >
                    <Wrench className="h-3 w-3 text-surface/50 shrink-0" />
                    <span>{t}()</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-surface/20">
              <div className="p-3 border border-surface/15 bg-surface/5 text-[11px] text-surface/60 font-mono leading-relaxed">
                <span className="text-surface font-bold">📍 Dubai, UAE:</span> Immediate availability, valid UAE & Indian driving licenses. Open to AI Engineer / Agent / Full-Stack roles.
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-8 flex flex-col bg-foreground min-h-[550px]">
          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" style={{ minHeight: 450, maxHeight: 650 }}>
            {messages.length === 0 && !apiError && (
              <div className="h-full flex flex-col items-start justify-center gap-6 py-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-400" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-surface/60">
                      SESSION READY · MODE: [{activeModeConfig.label}]
                    </span>
                  </div>
                  <h4 className="text-[18px] md:text-[22px] font-bold uppercase tracking-tight text-surface">
                    Ask me anything about my systems, decisions, or career.
                  </h4>
                  <p className="text-[13px] text-surface/60 mt-1 max-w-xl">
                    Select a starter prompt below or enter any technical question. Switch modes above to adjust answer depth.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeModeConfig.promptSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      disabled={isLoading}
                      className="px-3.5 py-2 border border-surface/25 text-[12px] font-mono uppercase tracking-wider bg-surface/5 text-surface/90 transition-all hover:bg-surface hover:text-foreground disabled:opacity-50 text-left"
                    >
                      → {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {apiError && (
              <div className="border border-red-500/40 bg-red-950/30 p-4 text-[13px] font-mono uppercase tracking-wider text-red-400">
                [SYSTEM ERROR]: {apiError}
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.role !== "user" && msg.role !== "assistant") return null;

                const msgAny = msg as { parts?: AnyPart[]; content?: string; id: string; role: string };
                const textContent = getTextFromParts(msgAny.parts, msgAny.content);
                if (!textContent && msg.role === "assistant") return null;

                const toolsUsed = msg.role === "assistant" ? getToolsFromParts(msgAny.parts) : [];
                const isAssistant = msg.role === "assistant";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] border px-5 py-4 text-[14px] leading-[1.65] relative group ${
                        msg.role === "user"
                          ? "bg-surface text-foreground border-surface font-mono"
                          : "bg-surface/5 text-surface border-surface/20"
                      }`}
                    >
                      {isAssistant && (
                        <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-surface/10">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-400" />
                            TAAQIB PROXY
                          </span>
                          <button
                            onClick={() => handleCopy(msg.id, textContent)}
                            className="text-surface/40 hover:text-surface transition-colors p-1"
                            title="Copy response to clipboard"
                            aria-label="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {isAssistant ? (
                        <>
                          <div className="prose prose-sm max-w-none dark:prose-invert relative inline-block w-full prose-headings:font-bold prose-headings:tracking-tight prose-headings:uppercase prose-p:my-2 prose-li:my-0.5">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
                            {msg.id === messages[messages.length - 1]?.id && isLoading && (
                              <span className="inline-block w-2.5 h-3.5 bg-emerald-400 ml-1.5 animate-pulse align-middle" />
                            )}
                          </div>
                          {toolsUsed.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-surface/15 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-surface/50">
                                Tools:
                              </span>
                              {toolsUsed.map((t) => (
                                <span
                                  key={t}
                                  className="flex items-center gap-1.5 border border-surface/20 bg-surface/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-surface/80"
                                >
                                  <Wrench className="h-2.5 w-2.5" />
                                  {TOOL_LABELS[t] ?? t}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span>{textContent}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Live Streaming Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400/90 bg-surface/5 border border-surface/15 px-3 py-2 w-fit"
              >
                <span className="w-2 h-2 bg-emerald-400 animate-ping" />
                <span>[ STREAMING FROM GROQ LPU™... {elapsedMs ? `${(elapsedMs / 1000).toFixed(1)}s` : ""} ]</span>
              </motion.div>
            )}

            {/* Dynamic Contextual Follow-up Chips */}
            {!isLoading && followUpSuggestions.length > 0 && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-surface/50 block mb-2">
                  Contextual Technical Follow-ups:
                </span>
                <div className="flex flex-wrap gap-2">
                  {followUpSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="px-3 py-1.5 border border-surface/20 bg-surface/5 text-[11px] font-mono uppercase tracking-wider text-surface/80 hover:bg-surface hover:text-foreground transition-all text-left"
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleFormSubmit} className="border-t border-surface/20 bg-foreground p-6 flex items-end gap-4">
            <div className="flex-1 border border-surface/20 relative focus-within:border-surface transition-colors">
              <div className="absolute left-4 top-3 flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-surface/50">
                  Command Prompt
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-surface/20 text-surface/50">
                  {activeMode.toUpperCase()}
                </span>
              </div>
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Reva AI, LTTS proctoring, STAR stories, or system architecture..."
                disabled={isLoading}
                aria-label="Chat input"
                className="w-full resize-none bg-transparent pt-8 pb-3 px-4 text-[15px] text-surface placeholder-surface/40 focus:outline-none focus:bg-surface/5 transition-colors disabled:opacity-50 font-mono"
                style={{ minHeight: 80, maxHeight: 160 }}
              />
            </div>
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="shrink-0 flex items-center justify-center h-[80px] w-[80px] border border-surface/20 bg-foreground text-surface hover:bg-surface/10 transition-colors"
                aria-label="Stop generation"
              >
                <span className="h-3.5 w-3.5 bg-surface" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="shrink-0 flex items-center justify-center h-[80px] w-[80px] border border-surface/20 bg-surface text-foreground hover:bg-surface/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
