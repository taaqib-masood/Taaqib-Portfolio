"use client";

import { motion } from "framer-motion";
import { ArrowDown, FileText, Terminal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

import { ThreeHero } from "./ThreeHero";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

export function Hero() {
  const handleAgentClick = () => {
    const agentEl = document.getElementById("agent");
    agentEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      <ThreeHero />

      <div className="z-10 flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-wrap justify-center gap-3"
        >
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            AI Engineer
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm font-medium text-slate-300">
            Ex-Intern @ L&T
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm font-medium text-slate-300">
            LLM Agents · RAG · MCP
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 , ease: [0.16, 1, 0.3, 1] }}
          className="font-heading mb-6 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl"
        >
          Taaqib Masood
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 , ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl text-2xl font-semibold text-slate-200 sm:text-3xl lg:text-4xl"
        >
          AI engineer building systems where the model isn&apos;t the demo, it&apos;s the infrastructure.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 , ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed"
        >
          Agentic tool-calling, RAG, MCP, and computer-vision pipelines that fail safely. Full-stack (Python, TypeScript) is the toolkit; reliable AI in production is the job. Based in Dubai, open to AI Engineering roles.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 , ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <Button
            size="lg"
            className="group gap-2 bg-violet-600 text-white hover:bg-violet-700"
            onClick={handleAgentClick}
          >
            <Terminal className="h-5 w-5" />
            Ask the agent
          </Button>
          <a
            href="/playground"
            className={buttonVariants({ variant: "outline", size: "lg", className: "group gap-2 border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 hover:text-white text-violet-300" })}
          >
            <Terminal className="h-5 w-5" />
            Groq Playground
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg", className: "group gap-2 border-slate-700 hover:bg-slate-800 hover:text-white" })}
          >
            <FileText className="h-5 w-5" />
            Download CV
          </a>
          <a
            href="https://github.com/taaqib-masood"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg", className: "group gap-2 border-slate-700 hover:bg-slate-800 hover:text-white" })}
          >
            <GithubIcon className="h-5 w-5" />
            GitHub
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 , ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <ArrowDown className="h-6 w-6 text-slate-500" />
      </motion.div>
    </section>
  );
}
