"use client";

import { useCompletion } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Database, GitPullRequest, FileCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const MOCK_DIFF = `@@ -15,7 +15,7 @@
 export async function getUser(req, res) {
   const { id } = req.body;
-  const query = \`SELECT * FROM users WHERE id = \${id}\`;
+  // TODO: Maybe sanitize this later?
+  const query = \`SELECT * FROM users WHERE id = \${id}\`;
   const result = await db.query(query);
   return res.json(result);
 }`;

const MOCK_JIRA_AC = "AC-1: Must use parameterized queries for all SQL inputs to prevent SQL injection.\nAC-2: Function must return 404 if user is not found.";

export function McpTeaser() {
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/mcp-review",
    onError: (err) => console.error("MCP Teaser Error:", err),
  });

  const handleRunReview = () => {
    complete("", {
      body: {
        prDiff: MOCK_DIFF,
        jiraAc: MOCK_JIRA_AC,
      },
    });
  };

  return (
    <section className="max-w-[1440px] mx-auto border-b border-border">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]">MCP Pipeline</h2>
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface-container-low flex flex-col justify-center">
          <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-outline">
            At LTTS, I built an automated code review pipeline that injects live Jira and Confluence context directly into the PR. Here is a simulated interactive demo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: PR Diff */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col"
        >
          <div className="bg-surface-container-low border-b border-border px-6 py-4 flex items-center gap-3">
            <GitPullRequest className="h-4 w-4 text-foreground" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-foreground">user-controller.js (PR #102)</span>
          </div>
          <div className="p-6 overflow-x-auto text-[14px] font-mono leading-[1.6] text-foreground flex-1">
            <pre>
              <code dangerouslySetInnerHTML={{
                __html: MOCK_DIFF.replace(
                  /-  const query.*/g,
                  '<span class="text-destructive bg-destructive/10 block">$&</span>'
                ).replace(
                  /\+  \/\/ TODO:.*/g,
                  '<span class="text-[#22c55e] bg-[#22c55e]/10 block">$&</span>'
                ).replace(
                  /\+  const query.*/g,
                  '<span class="text-[#22c55e] bg-[#22c55e]/10 block">$&</span>'
                )
              }} />
            </pre>
          </div>
        </motion.div>

        {/* Right: Context + Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col bg-surface"
        >
          {/* Jira AC */}
          <div className="flex-1 flex flex-col border-b border-border">
            <div className="bg-surface-container-low border-b border-border px-6 py-4 flex items-center gap-3">
              <Database className="h-4 w-4 text-foreground" />
              <span className="text-[12px] font-bold uppercase tracking-widest text-foreground">MCP Context: Jira-7742</span>
            </div>
            <div className="p-6 text-[14px] leading-[1.6] text-outline space-y-4">
              {MOCK_JIRA_AC.split('\n').map((ac, i) => (
                <div key={i} className="flex gap-3">
                  <FileCheck className="h-4 w-4 text-foreground shrink-0 mt-1" />
                  <span>{ac}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunReview}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 w-full py-6 bg-primary hover:bg-foreground text-on-primary hover:text-surface text-[14px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            {isLoading ? "Analyzing Context & Diff..." : "Run MCP Review"}
          </button>
        </motion.div>
      </div>

      {/* Results Box */}
      <AnimatePresence>
        {(completion || isLoading) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-border bg-surface overflow-hidden"
          >
            <div className="bg-surface-container-low border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="h-4 w-4 text-foreground" />
                <span className="text-[12px] font-bold uppercase tracking-widest text-foreground">AI Code Review Output</span>
              </div>
              {isLoading ? (
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline flex items-center gap-2 border border-border bg-surface px-3 py-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Streaming
                </span>
              ) : completion.toLowerCase().includes("approve") ? (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e] flex items-center gap-2 border border-[#22c55e] bg-[#22c55e]/10 px-3 py-1">
                  <CheckCircle2 className="h-3 w-3" /> Approved
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-destructive flex items-center gap-2 border border-destructive bg-destructive/10 px-3 py-1">
                  <XCircle className="h-3 w-3" /> Changes Requested
                </span>
              )}
            </div>
            <div className="p-6 prose prose-sm max-w-none text-foreground text-[14px] leading-[1.6]">
              <ReactMarkdown>{completion}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SparklesIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
