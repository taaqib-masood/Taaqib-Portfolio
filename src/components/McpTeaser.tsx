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
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center"
      >
        <h2 className="font-heading text-4xl font-bold mb-4">Model Context Protocol (MCP) in Action</h2>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto">
          At LTTS, I built an automated code review pipeline that injects live Jira and Confluence context directly into the PR. Here&apos;s a simulated interactive demo.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: PR Diff */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 , ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden flex flex-col"
        >
          <div className="bg-slate-950/50 border-b border-slate-800 px-4 py-3 flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-slate-300">user-controller.js (PR #102)</span>
          </div>
          <div className="p-4 overflow-x-auto text-sm font-mono text-slate-300 flex-1">
            <pre>
              <code dangerouslySetInnerHTML={{
                __html: MOCK_DIFF.replace(
                  /-  const query.*/g,
                  '<span class="text-red-400 bg-red-500/10 block">$&</span>'
                ).replace(
                  /\+  \/\/ TODO:.*/g,
                  '<span class="text-green-400 bg-green-500/10 block">$&</span>'
                ).replace(
                  /\+  const query.*/g,
                  '<span class="text-green-400 bg-green-500/10 block">$&</span>'
                )
              }} />
            </pre>
          </div>
        </motion.div>

        {/* Right: Context + Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 , ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          {/* Jira AC */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden flex-1 flex flex-col">
            <div className="bg-slate-950/50 border-b border-slate-800 px-4 py-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">MCP Context: Jira-7742</span>
            </div>
            <div className="p-5 text-sm text-slate-300 space-y-3">
              {MOCK_JIRA_AC.split('\n').map((ac, i) => (
                <div key={i} className="flex gap-2">
                  <FileCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{ac}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunReview}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
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
            className="rounded-2xl border border-violet-500/30 bg-violet-500/5 backdrop-blur-xl overflow-hidden"
          >
            <div className="bg-slate-950/50 border-b border-slate-800/50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-violet-400" />
                <span className="font-semibold text-white">AI Code Review</span>
              </div>
              {isLoading ? (
                <span className="text-xs font-medium text-violet-400 flex items-center gap-1.5 bg-violet-500/10 px-2 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                  </span>
                  Streaming
                </span>
              ) : completion.toLowerCase().includes("approve") ? (
                <span className="text-xs font-medium text-green-400 flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                </span>
              ) : (
                <span className="text-xs font-medium text-red-400 flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-full">
                  <XCircle className="h-3.5 w-3.5" /> Changes Requested
                </span>
              )}
            </div>
            <div className="p-6 prose prose-sm prose-invert max-w-none text-slate-300">
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
