"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import type { AgentMetrics } from "@/lib/agent-telemetry";
import { useT } from "@/components/LocaleProvider";

// Below-the-fold sections ship in their own chunks so the hero's JS parses first.
// Client-only on purpose: server-rendered next/dynamic chunks are emitted as <script> tags
// without the CSP nonce and get blocked; runtime-loaded chunks are trusted via 'strict-dynamic'.
// The placeholder keeps each section's id and height so anchors land and nothing jumps.
const placeholder = (id: string, minH: string) => function SectionPlaceholder() {
  return <section id={id} aria-busy="true" className={`max-w-[1440px] mx-auto border-b border-border ${minH}`} />;
};
const H = {
  agent: "min-h-[1800px] md:min-h-[1600px] lg:min-h-[900px]",
  github: "min-h-[1850px] md:min-h-[1200px] lg:min-h-[870px]",
  contact: "min-h-[1350px] lg:min-h-[717px]",
};
const Agent = dynamic(() => import("@/components/Agent").then((m) => m.Agent), { ssr: false, loading: placeholder("agent", H.agent) });
const GithubGraph = dynamic(() => import("@/components/GithubGraph").then((m) => m.GithubGraph), { ssr: false, loading: placeholder("github", H.github) });
const Contact = dynamic(() => import("@/components/Contact").then((m) => m.Contact), { ssr: false, loading: placeholder("contact", H.contact) });

// Mounts its (lazy) section once the placeholder is within ~1.5 screens (or, on desktop, the page is idle),
// so the chat, GitHub and contact code never compete with the first paint on a phone. `force` mounts at
// once (e.g. an agent prefill or a #hash link that targets the section). Placeholder heights match the
// real sections per breakpoint (measured), so anchor jumps past them don't land short when they mount.
function Near({ id, minH, force, children }: { id: string; minH: string; force?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near || !ref.current) return;
    if (window.location.hash === `#${id}`) return setNear(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: "150% 0px" });
    io.observe(ref.current);
    // On desktop, also mount once the page has settled so it's ready before anyone scrolls there.
    // Phones skip this: on a slow connection they only pay for what they scroll towards.
    const idle = () => (window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1)))(() => setNear(true), { timeout: 4000 });
    const timer = window.matchMedia("(min-width: 768px)").matches ? setTimeout(idle, 2500) : undefined;
    return () => { io.disconnect(); clearTimeout(timer); };
  }, [near, id]);
  if (near || force) return <>{children}</>;
  return <section ref={ref} id={id} aria-busy="true" className={`max-w-[1440px] mx-auto border-b border-border ${minH}`} />;
}

export default function Home() {
  const t = useT();
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
      {/* Phones: a solid bar behind the fixed toggles so they never sit on top of headings or white sections. */}
      <div aria-hidden="true" className="sm:hidden fixed top-0 inset-x-0 h-[72px] bg-background border-b border-border z-40" />
      <LanguageToggle />
      <AudienceToggle />
      <Hero />
      <QuickFacts />
      <About />
      <Near id="agent" minH={H.agent} force={agentPrefill !== null}>
        <Agent prefillMessage={agentPrefill} onMetrics={setAgentMetrics} />
      </Near>
      <Projects onAskAgent={handleAskAgentAboutProject} activeSkill={activeSkill} />
      <McpTeaser />
      <Skills activeSkill={activeSkill} onSkillSelect={setActiveSkill} />
      <Experience />
      <Near id="github" minH={H.github}><GithubGraph /></Near>
      <Near id="contact" minH={H.contact}><Contact /></Near>

      <Marquee />

      <footer className="border-t border-border bg-surface py-8 text-[12px] text-outline font-semibold uppercase tracking-widest mt-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Taaqib Masood</p>
          <p className="hidden md:block border border-border px-4 py-2">{t("Model isn\u2019t the demo, it\u2019s the infrastructure.")}</p>
          <p>{t("Built with Next.js, three.js & Framer Motion")}</p>
        </div>
      </footer>
      <StatusBar metrics={agentMetrics} />
    </main>
    </MotionConfig>
  );
}
