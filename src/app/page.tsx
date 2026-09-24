"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { McpTeaser } from "@/components/McpTeaser";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Marquee } from "@/components/Marquee";
import { StatusBar } from "@/components/StatusBar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { AudienceToggle } from "@/components/AudienceToggle";
import { QuickFacts } from "@/components/QuickFacts";
import { projects } from "@/data/projects";
import { ScrollHairline } from "@/components/ScrollHairline";
import { Toaster } from "@/components/ui/sonner";
import type { AgentMetrics } from "@/lib/agent-telemetry";

// Below-the-fold sections ship in their own chunks so the hero's JS parses first.
// Client-only on purpose: server-rendered next/dynamic chunks are emitted as <script> tags
// without the CSP nonce and get blocked; runtime-loaded chunks are trusted via 'strict-dynamic'.
// The placeholder keeps each section's id and height so anchors land and nothing jumps.
const placeholder = (id: string, minH: string) => function SectionPlaceholder() {
  return <section id={id} aria-busy="true" className={`max-w-[1440px] mx-auto border-b border-border ${minH}`} />;
};
const Agent = dynamic(() => import("@/components/Agent").then((m) => m.Agent), { ssr: false, loading: placeholder("agent", "min-h-[900px]") });
const GithubGraph = dynamic(() => import("@/components/GithubGraph").then((m) => m.GithubGraph), { ssr: false, loading: placeholder("github", "min-h-[700px]") });
const Contact = dynamic(() => import("@/components/Contact").then((m) => m.Contact), { ssr: false, loading: placeholder("contact", "min-h-[600px]") });

export default function Home() {
  const [agentPrefill, setAgentPrefill] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics | null>(null);

  const handleAskAgentAboutProject = useCallback((title: string) => {
    setAgentPrefill(`Tell me about the "${title}" project.`);
    const agentSection = document.getElementById("agent");
    agentSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
    }
  }, []);

  useEffect(() => {
    const handleWakeUp = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAgentPrefill(customEvent.detail);
    };
    window.addEventListener("wakeUpAgent", handleWakeUp);
    return () => window.removeEventListener("wakeUpAgent", handleWakeUp);
  }, []);

  // Case-study pages link to /?ask=<slug>#agent: prefill the agent with that project.
  // Only known slugs are accepted, so the URL can't inject arbitrary prompt text.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("ask");
    const project = projects.find((p) => p.slug === slug);
    if (project) setAgentPrefill(`Tell me about the "${project.title}" project.`);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-on-primary pb-[48px]">
      <ScrollHairline />
      <LanguageToggle />
      <AudienceToggle />
      <Hero />
      <QuickFacts />
      <About />
      <Agent prefillMessage={agentPrefill} onMetrics={setAgentMetrics} />
      <Projects onAskAgent={handleAskAgentAboutProject} activeSkill={activeSkill} />
      <McpTeaser />
      <Skills activeSkill={activeSkill} onSkillSelect={setActiveSkill} />
      <Experience />
      <GithubGraph />
      <Contact />

      <Marquee />

      <footer className="border-t border-border bg-surface py-8 text-[12px] text-outline font-semibold uppercase tracking-widest mt-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Taaqib Masood</p>
          <p className="hidden md:block border border-border px-4 py-2">Model isn&apos;t the demo, it&apos;s the infrastructure.</p>
          <p>Built with Next.js, three.js & Framer Motion</p>
        </div>
      </footer>
      <StatusBar metrics={agentMetrics} />
      <Toaster position="bottom-right" className="rounded-none border-border" />
    </main>
    </MotionConfig>
  );
}
