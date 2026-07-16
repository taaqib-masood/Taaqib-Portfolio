"use client";

import { useState, useCallback, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Agent } from "@/components/Agent";
import { Projects } from "@/components/Projects";
import { McpTeaser } from "@/components/McpTeaser";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { GithubGraph } from "@/components/GithubGraph";
import { Contact } from "@/components/Contact";
import { Marquee } from "@/components/Marquee";
import { StatusBar } from "@/components/StatusBar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ScrollHairline } from "@/components/ScrollHairline";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [agentPrefill, setAgentPrefill] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const handleAskAgentAboutProject = useCallback((title: string) => {
    setAgentPrefill(`Tell me about the "${title}" project.`);
    const agentSection = document.getElementById("agent");
    agentSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const handleWakeUp = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAgentPrefill(customEvent.detail);
    };
    window.addEventListener("wakeUpAgent", handleWakeUp);
    return () => window.removeEventListener("wakeUpAgent", handleWakeUp);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-on-primary pb-[48px]">
      <ScrollHairline />
      <LanguageToggle />
      <Hero />
      <About />
      <Agent prefillMessage={agentPrefill} />
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
          <p>Built with Next.js & Framer Motion</p>
        </div>
      </footer>
      <StatusBar />
      <Toaster position="bottom-right" className="rounded-none border-border" />
    </main>
  );
}
