"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2, Settings2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper for AI SDK v6 message parts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTextFromParts(parts: any[] | undefined, content: string | undefined): string {
  if (!parts || parts.length === 0) return content ?? "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text as string)
    .join("");
}

export default function PlaygroundPage() {
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. Respond concisely."
  );
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/playground", body: { systemPrompt, temperature, maxTokens } }),
    [systemPrompt, temperature, maxTokens]
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (err) => {
      console.error("Playground error:", err);
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

  const submitMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-violet-500/30">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
        </div>
        <div className="flex items-center gap-2 text-violet-400 font-heading font-bold">
          <Sparkles className="h-5 w-5" />
          Groq LLM Playground
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 h-[calc(100vh-73px)]">
        {/* Left Panel: Settings */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col gap-6 h-full overflow-y-auto">
            <div className="flex items-center gap-2 text-white font-semibold border-b border-slate-800 pb-3">
              <Settings2 className="h-5 w-5 text-violet-500" />
              Agent Configuration
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300">
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 resize-none"
                placeholder="You are a helpful AI assistant..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium text-slate-300">Temperature</label>
                <span className="text-slate-500 font-mono">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium text-slate-300">Max Tokens</label>
                <span className="text-slate-500 font-mono">{maxTokens}</span>
              </div>
              <input
                type="number"
                min="1"
                max="8192"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            <div className="mt-auto pt-4 text-xs text-slate-500 border-t border-slate-800">
              Model: <span className="text-violet-400">llama-3.3-70b-versatile</span>
            </div>
          </div>
        </aside>

        {/* Right Panel: Chat */}
        <section className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden h-full">
          <div
            className="flex-1 overflow-y-auto p-6 space-y-4"
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <Sparkles className="h-10 w-10 text-violet-500/20 mb-3" />
                <p>Adjust settings on the left and start chatting.</p>
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.role !== "user" && msg.role !== "assistant") return null;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const textContent = getTextFromParts((msg as any).parts, (msg as any).content);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700/50"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {textContent}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{textContent}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-slate-500 text-sm pl-2"
              >
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                <span>Thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/60">
            <form onSubmit={handleFormSubmit} className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 resize-none bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                style={{ minHeight: 46, maxHeight: 160 }}
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="shrink-0 flex items-center justify-center h-11 w-11 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500"
                >
                  <span className="h-3 w-3 rounded-sm bg-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="shrink-0 flex items-center justify-center h-11 w-11 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
