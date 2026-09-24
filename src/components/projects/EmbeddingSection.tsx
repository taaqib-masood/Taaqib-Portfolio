"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudies } from "@/data/case-studies";
import { useAudience } from "@/lib/audience";
import type { Project } from "@/data/projects";
import { useWebGLGate } from "@/lib/use-webgl";
import { matchesSkill } from "@/lib/embedding";
import { useT } from "@/components/LocaleProvider";

const EmbeddingSpace = dynamic(() => import("@/components/projects/EmbeddingSpace"), { ssr: false });

export const projectYear = (p: Project) => p.role.match(/20\d\d/g)?.at(-1) ?? null;

/**
 * Pinned scroll scene: each project is a cluster in a latent space and scrolling flies
 * the camera node to node. Desktop + motion-allowed only; the card grid below stays the
 * accessible list and the only view on mobile / reduced motion.
 */
export function EmbeddingSection({ projects, activeSkill, onAskAgent }: {
  projects: Project[];
  activeSkill: string | null;
  onAskAgent: (title: string) => void;
}) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { supported, reduced, animate } = useWebGLGate(ref, "(min-width: 768px)");
  // Hidden via CSS (not an early return) so server and client markup match.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [focus, setFocus] = useState(0);
  const plain = useAudience() === "plain";
  useMotionValueEvent(scrollYProgress, "change", (v) => setFocus(Math.round(v * (projects.length - 1))));

  const p = projects[focus];
  const year = projectYear(p);
  const matchCount = projects.filter((x) => matchesSkill(x, activeSkill)).length;

  const jumpTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / (projects.length - 1)) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <div ref={ref} className="hidden md:block motion-reduce:!hidden relative border-b border-border" style={{ height: `${projects.length * 60}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        {supported && !reduced && <EmbeddingSpace projects={projects} activeSkill={activeSkill} progress={scrollYProgress} animate={animate} />}

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between pl-8 pr-40 py-4 border-b border-border bg-background/80 font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
          <span>{t("Latent space")} · {projects.length} {t("nodes")} · {t("edges = shared stack")}</span>
          <span className={activeSkill ? "text-primary" : ""}>
            {activeSkill ? `${t("Query")} “${activeSkill}” · ${matchCount}/${projects.length} ${t("match")}` : t("Select a skill below to query")}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.83, 0, 0.17, 1] }}
            className={`absolute right-8 bottom-24 w-[420px] border bg-background ${matchesSkill(p, activeSkill) ? "border-border" : "border-outline-variant opacity-60"}`}
          >
            <div className="flex justify-between px-6 py-4 border-b border-border font-mono text-[11px] uppercase tracking-[0.16em]">
              <span>{t("Node")} {String(focus + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
              <span className="text-on-surface-variant">{p.categories.map(t).join(" · ")}{year ? ` · ${year}` : ""}</span>
            </div>
            <div className="p-6">
              <h3 className="text-[28px] font-bold uppercase tracking-[-0.03em] leading-[1.05]">{t(p.title)}</h3>
              <p className="mt-4 text-[14px] leading-[1.5] text-on-surface-variant line-clamp-3">{t((plain && caseStudies[p.slug]?.plain) || p.blurb)}</p>
              <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">{t(p.metrics[0])}</p>
            </div>
            <div className="grid grid-cols-2 border-t border-border text-[12px] font-bold uppercase tracking-widest">
              <Link href={`/projects/${p.slug}`} className="min-h-12 flex items-center justify-center uppercase border-r border-border hover:bg-foreground hover:text-background transition-colors">{t("Case study")}</Link>
              <button onClick={() => onAskAgent(p.title)} className="min-h-12 uppercase flex items-center justify-center gap-2 bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors">
                {t("Ask agent")} <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <nav aria-label="Project nodes" className="absolute start-8 bottom-40 w-[320px]">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant mb-3">{t("Scroll · camera path")}</div>
          <div className="h-[2px] bg-outline-variant relative mb-3">
            <motion.div className="absolute inset-y-0 left-0 right-0 bg-primary origin-left" style={{ scaleX: scrollYProgress }} />
          </div>
          <div className="flex justify-between">
            {projects.map((x, i) => (
              <button
                key={x.slug}
                onClick={() => jumpTo(i)}
                aria-label={`Fly to ${x.title}`}
                aria-current={i === focus}
                className={`font-mono text-[11px] min-w-8 min-h-8 transition-colors ${i === focus ? "text-foreground" : "text-outline hover:text-foreground"}`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
