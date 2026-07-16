"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Wrench } from "lucide-react";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { VerticalLine } from "@/components/VerticalLine";

const SUGGESTED_PROMPTS = [
  "What did you build at LTTS?",
  "Explain your MCP pipeline",
  "Which project uses edge AI?",
  "What's your tech stack?",
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

export function Agent({ prefillMessage }: { prefillMessage?: string | null }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat/stream" }),
    []
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (err: Error) => {
      const msg =
        err.message?.includes("GROQ_API_KEY")
          ? "GROQ_API_KEY is not configured. Add it to .env.local to enable the agent."
          : "Something went wrong. Please try again.";
      setApiError(msg);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <section id="agent" className="max-w-[1440px] mx-auto border-b border-surface/20 bg-foreground text-surface">
      
      {/* Header */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 border-b border-surface/20 overflow-hidden z-0">
        <ParallaxNumber number="05" />
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 relative flex flex-col justify-center">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] relative z-10">Agent Terminal</h2>
          <VerticalLine className="bg-surface/20" />
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface/5 flex flex-col justify-center">
          <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-surface/60">
            Interface directly with the LLaMA 3.3 agent. Query tech stacks, availability, and neural paradigms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Info Panel */}
        <div className="lg:col-span-4 border-b lg:border-b-0 relative flex flex-col">
          <VerticalLine className="bg-surface/20" />
          <div className="p-6 md:p-8 border-b border-surface/20 bg-foreground flex-1">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6">System Architecture</h3>
            <ul className="space-y-4 text-[14px] leading-[1.5] text-surface/60">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-surface mt-1.5 flex-shrink-0" />
                <span>Runs on <strong className="text-surface">Groq LLaMA 3.3-70b</strong> via the Vercel AI SDK.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-surface mt-1.5 flex-shrink-0" />
                <span>Uses <strong className="text-surface">tool-calling</strong> to fetch grounded data — no hallucinations.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-surface mt-1.5 flex-shrink-0" />
                <span>Runs at the <strong className="text-surface">Next.js Edge Runtime</strong> for sub-100ms latency.</span>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-surface/20">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6">Available Tools</h3>
              <div className="flex flex-col gap-2">
                {Object.keys(TOOL_LABELS).map((t) => (
                  <div key={t} className="flex items-center gap-3 border border-surface/20 bg-surface/10 px-3 py-2 text-[12px] font-semibold uppercase tracking-widest">
                    <Wrench className="h-3 w-3 text-surface shrink-0" />
                    <span>{t}()</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-8 flex flex-col bg-foreground min-h-[500px]">
          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" style={{ minHeight: 400, maxHeight: 600 }}>
            {messages.length === 0 && !apiError && (
              <div className="h-full flex flex-col items-start justify-center gap-6">
                <p className="text-[16px] uppercase font-bold tracking-widest text-surface/60">
                  Session initialized. Awaiting user input sequence.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      disabled={isLoading}
                      className="px-4 py-2 border border-surface/20 text-[12px] font-semibold uppercase tracking-widest bg-foreground transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {apiError && (
              <div className="border border-surface/20 bg-surface/10 p-4 text-[14px] font-semibold uppercase tracking-widest text-red-500">
                Error: {apiError}
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.role !== "user" && msg.role !== "assistant") return null;

                const msgAny = msg as { parts?: AnyPart[], content?: string, id: string, role: string };
                const textContent = getTextFromParts(msgAny.parts, msgAny.content);
                if (!textContent && msg.role === "assistant") return null;

                const toolsUsed = msg.role === "assistant" ? getToolsFromParts(msgAny.parts) : [];

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] border border-surface/20 px-6 py-4 text-[14px] leading-[1.6] ${
                        msg.role === "user" ? "bg-surface text-foreground" : "bg-surface/5 text-surface"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <>
                          <div className="prose prose-sm max-w-none dark:prose-invert relative inline-block w-full">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
                            {msg.id === messages[messages.length - 1]?.id && isLoading && (
                              <span className="inline-block w-2.5 h-2.5 bg-surface ml-2 animate-[pulse_1s_ease-in-out_infinite] align-baseline" />
                            )}
                          </div>
                          {toolsUsed.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-surface/20 flex flex-wrap gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-surface/60 pt-1">
                                Sources:
                              </span>
                              {toolsUsed.map((t) => (
                                <span key={t} className="flex items-center gap-2 border border-surface/20 bg-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                                  <Wrench className="h-3 w-3" />
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

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-[12px] font-mono font-bold uppercase tracking-widest text-surface/60">
                <span>[ FETCHING_DATA... ]</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleFormSubmit} className="border-t border-surface/20 bg-foreground p-6 flex items-end gap-4">
            <div className="flex-1 border border-surface/20 relative">
              <span className="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-widest text-surface/60">Input</span>
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Execute command..."
                disabled={isLoading}
                aria-label="Chat input"
                className="w-full resize-none bg-transparent pt-8 pb-4 px-4 text-[16px] text-surface placeholder-surface/60 focus:outline-none focus:bg-surface/5 transition-colors disabled:opacity-50"
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
                <span className="h-4 w-4 bg-surface" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="shrink-0 flex items-center justify-center h-[80px] w-[80px] border border-surface/20 bg-surface text-foreground hover:bg-surface/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="h-6 w-6" />
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
