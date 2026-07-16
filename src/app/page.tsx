"use client";

import { useState, useCallback } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Agent } from "@/components/Agent";
import { Projects } from "@/components/Projects";
import { McpTeaser } from "@/components/McpTeaser";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { GithubGraph } from "@/components/GithubGraph";
import { Contact } from "@/components/Contact";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [agentPrefill, setAgentPrefill] = useState<string | null>(null);

  const handleAskAgentAboutProject = useCallback((title: string) => {
    setAgentPrefill(`Tell me about the "${title}" project.`);
    const agentSection = document.getElementById("agent");
    agentSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-violet-500/30">
      <Hero />
      <About />
      <Agent prefillMessage={agentPrefill} />
      <Projects onAskAgent={handleAskAgentAboutProject} />
      <McpTeaser />
      <Skills />
      <Experience />
      <GithubGraph />
      <Contact />

      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Taaqib Masood</p>
          <p className="italic">&quot;Model isn&apos;t the demo, it&apos;s the infrastructure.&quot;</p>
          <p>Built with Next.js, shadcn/ui, Framer Motion</p>
        </div>
      </footer>
      <Toaster theme="dark" position="bottom-right" />
    </main>
  );
}
