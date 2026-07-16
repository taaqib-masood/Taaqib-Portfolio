"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, BrainCircuit, Terminal, Wrench } from "lucide-react";

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

// ── Helpers for AI SDK v6 message parts ──────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- AI SDK v6 parts are typed as any
type AnyPart = any;

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

  // AI SDK v6 transport-based useChat
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

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [inputValue]);

  // Pre-fill from project modal
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
    <section
      id="agent"
      aria-labelledby="agent-heading"
      className="py-24 px-6 max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center"
      >
        <h2 id="agent-heading" className="font-heading text-4xl font-bold mb-4">
          Ask the Agent
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          This isn&apos;t a chatbot widget — it&apos;s a Groq-powered LLaMA 3.3
          agent with tool-calling, streaming live on this site. Ask it anything
          about my work.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Chat Window ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 , ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden"
          style={{ minHeight: 500 }}
        >
          {/* Message list */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-4"
            role="log"
            aria-live="polite"
            aria-label="Agent conversation"
            style={{ minHeight: 380, maxHeight: 520 }}
          >
            {messages.length === 0 && !apiError && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                <BrainCircuit className="h-12 w-12 text-violet-500/50" />
                <p className="text-slate-500 text-base">
                  Ask me about Taaqib&apos;s projects, experience, or skills.
                </p>
              </div>
            )}

            {apiError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
                <strong>Agent unavailable:</strong> {apiError}
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.role !== "user" && msg.role !== "assistant") return null;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AI SDK v6 UIMessage
                const msgAny = msg as any;
                const textContent = getTextFromParts(msgAny.parts, msgAny.content);
                if (!textContent && msg.role === "assistant") return null;

                const toolsUsed =
                  msg.role === "assistant" ? getToolsFromParts(msgAny.parts) : [];

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 , ease: [0.16, 1, 0.3, 1] }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-slate-800/80 text-slate-200 rounded-bl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <>
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {textContent}
                            </ReactMarkdown>
                          </div>
                          {toolsUsed.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
                              <span className="text-xs text-slate-500">
                                Sources:
                              </span>
                              {toolsUsed.map((t) => (
                                <span
                                  key={t}
                                  className="flex items-center gap-1 text-xs bg-violet-500/15 text-violet-400 border border-violet-500/30 rounded-full px-2 py-0.5"
                                >
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

            {/* Typing / fetching indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-slate-500 text-sm"
              >
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                <span>Fetching data...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts — only shown on empty state */}
          {messages.length === 0 && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={isLoading}
                  className="text-xs bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <form
            onSubmit={handleFormSubmit}
            className="border-t border-slate-800 p-4 flex items-end gap-3"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Taaqib's experience, projects, or tech stack..."
              disabled={isLoading}
              aria-label="Chat input"
              className="flex-1 resize-none bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 overflow-hidden"
              style={{ minHeight: 44, maxHeight: 160 }}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="shrink-0 flex items-center justify-center h-11 w-11 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                aria-label="Stop generation"
              >
                <span className="h-3 w-3 rounded-sm bg-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="shrink-0 flex items-center justify-center h-11 w-11 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>
        </motion.div>

        {/* ── Info Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 , ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-full p-2">
                <Terminal className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">
                How it works
              </h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">▸</span>
                <span>
                  Runs on{" "}
                  <strong className="text-slate-300">Groq LLaMA 3.3-70b</strong>{" "}
                  via the Vercel AI SDK.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">▸</span>
                <span>
                  Uses{" "}
                  <strong className="text-slate-300">tool-calling</strong> to
                  fetch grounded data — no hallucinations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">▸</span>
                <span>
                  Runs at the{" "}
                  <strong className="text-slate-300">
                    Next.js Edge Runtime
                  </strong>{" "}
                  for sub-100ms first-token latency.
                </span>
              </li>
            </ul>

            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">
                Available Tools
              </p>
              <div className="flex flex-col gap-2">
                {Object.keys(TOOL_LABELS).map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400"
                  >
                    <Wrench className="h-3 w-3 text-violet-500 shrink-0" />
                    <code className="font-mono text-violet-300">{t}()</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 text-sm text-slate-400">
            <p className="font-semibold text-violet-300 mb-2">
              Same pattern used at LTTS
            </p>
            <p>
              This deliberate tool-trigger architecture mirrors the LTTS Copilot
              I built at L&T Technology Services — scoped function-calling with
              prompt-engineered constraints to eliminate hallucinated tool calls
              in production.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
