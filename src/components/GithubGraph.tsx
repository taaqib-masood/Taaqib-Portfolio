"use client";

import { useEffect, useState, cloneElement, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { TokenText } from "@/components/TokenText";
import { Star, GitFork, Loader2, Calendar, Terminal, Filter, ArrowUpRight } from "lucide-react";
import type { Activity as CalendarActivity } from "react-activity-calendar";
import { getGithubFeed } from "@/lib/github-feed";
import type { GithubFeed } from "@/app/api/github/route";
import { useT } from "@/components/LocaleProvider";

const ActivityCalendar = dynamic(
  () => import("react-activity-calendar").then((mod) => mod.ActivityCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[140px] flex items-center justify-center">
        <Loader2 className="h-5 w-5 text-outline animate-spin" />
      </div>
    ),
  }
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

interface Repo {
  name: string;
  stargazers_count: number | null; // null until the live feed answers: never show a guessed count
  forks_count: number | null;
  html_url: string;
  language: string | null;
  description: string | null;
  category?: "AI & Agents" | "Quant & ML" | "Full-Stack";
}

const FALLBACK_REPOS: Repo[] = [
  {
    name: "smart-hospital-agent",
    stargazers_count: null,
    forks_count: null,
    html_url: "https://github.com/taaqib-masood/smart-hospital-agent",
    language: "TypeScript",
    description: "Reva AI: WhatsApp receptionist & clinic management with Next.js 16, Meta Cloud API, and Supabase RLS.",
    category: "AI & Agents",
  },
  {
    name: "atlas-ai",
    stargazers_count: null,
    forks_count: null,
    html_url: "https://github.com/taaqib-masood/atlas-ai",
    language: "JavaScript",
    description: "AI tool directory: zero-dependency Node.js SSR, built-in SQLite, explainable recommendations, admin change ledger.",
    category: "Full-Stack",
  },
  {
    name: "stock-market-forecasting-risk-analytics",
    stargazers_count: null,
    forks_count: null,
    html_url: "https://github.com/taaqib-masood/stock-market-forecasting-risk-analytics",
    language: "Python",
    description: "Boro: trading, risk & compliance platform. ARIMA + LightGBM ensemble, FinBERT sentiment, 10+ enforced risk rules.",
    category: "Quant & ML",
  },
  {
    name: "predictive-maintenance-industrial-machinery",
    stargazers_count: null,
    forks_count: null,
    html_url: "https://github.com/taaqib-masood/predictive-maintenance-industrial-machinery",
    language: "Python",
    description: "NASA CMAPSS turbofan remaining-useful-life prediction: GBM + LSTM + CNN hybrid, quantized to TensorFlow Lite.",
    category: "Quant & ML",
  },
  {
    name: "salon-booking-saas",
    stargazers_count: null,
    forks_count: null,
    html_url: "https://github.com/taaqib-masood/salon-booking-saas",
    language: "TypeScript",
    description: "Bilingual UAE Arabic/English appointment booking engine with Stripe/Square and BullMQ WhatsApp alerts.",
    category: "Full-Stack",
  },
  {
    name: "Taaqib-Portfolio",
    stargazers_count: null,
    forks_count: null,
    html_url: "https://github.com/taaqib-masood/Taaqib-Portfolio",
    language: "TypeScript",
    description: "Swiss brutalist AI portfolio: WebGL scenes, a tool-calling interview agent, and a live GitHub feed.",
    category: "Full-Stack",
  },
];

export function GithubGraph() {
  const t = useT();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<CalendarActivity | null>(null);
  const [contributions, setContributions] = useState<GithubFeed["contributions"] | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    getGithubFeed().then((feed) => {
      // Live stars/forks merged into the curated list; unknown stays null, never invented.
      setRepos(FALLBACK_REPOS.map((repo) => {
        const live = feed.repos?.find((r) => r.name.toLowerCase() === repo.name.toLowerCase());
        return live ? { ...repo, stargazers_count: live.stars, forks_count: live.forks, language: live.language ?? repo.language } : repo;
      }));
      setContributions(feed.contributions);
      setLoading(false);
    });
  }, []);

  const activeDays = contributions?.days.filter((d) => d.count > 0).length ?? 0;

  const filteredRepos = useMemo(() => {
    if (selectedCategory === "ALL") return repos;
    return repos.filter((r) => r.category === selectedCategory);
  }, [repos, selectedCategory]);

  const handleAskAgentAboutGithub = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("wakeUpAgent", {
          detail: "What open-source and GitHub repositories has Taaqib built? Walk me through his architecture and code quality across AI agents, quant ML, and full-stack systems.",
        })
      );
      document.getElementById("agent")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="github" className="max-w-[1440px] mx-auto border-b border-border">
      
      {/* Header */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 border-b border-border overflow-hidden">
        <ParallaxNumber number="07" />
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center">
          <h2 className="relative z-10 text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] flex items-center gap-4">
            <GithubIcon className="h-8 md:h-12 w-8 md:w-12 text-foreground" />
            <TokenText text="GitHub" />
          </h2>
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-outline">
              {t("Consistent contributions and open-source projects tracking logic layer developments.")}
            </p>
            <p className="text-[12px] font-mono text-outline/80 mt-1">
              {t("Hover any calendar block to inspect real-time daily commit telemetry.")}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleAskAgentAboutGithub}
              className="inline-flex items-center gap-2 px-3 py-1.5 max-sm:min-h-10 border border-primary/50 bg-primary/10 hover:bg-primary hover:text-on-primary text-primary transition-all text-[11px] font-mono font-bold tracking-wider uppercase cursor-pointer"
            >
              <Terminal className="h-3 w-3" />
              {t("Ask AI Agent")}
            </button>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-surface text-[11px] font-mono font-bold tracking-wider uppercase text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {contributions ? `${contributions.total.toLocaleString("en-US")} ${t("contributions / yr")}` : t("Live feed")}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="border-b border-border p-6 md:p-8 overflow-x-auto flex justify-center bg-surface">
        <div className="min-w-fit">
          {contributions === undefined ? (
            <div className="h-[140px] flex items-center justify-center"><Loader2 className="h-5 w-5 text-outline animate-spin" /></div>
          ) : contributions && contributions.days.length > 0 ? (
            <ActivityCalendar
              data={contributions.days}
              colorScheme="light"
              theme={{ light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] }}
              blockSize={14}
              blockMargin={6}
              fontSize={12}
              renderBlock={(block, activity) =>
                cloneElement(block, {
                  onMouseEnter: () => setHoveredDay(activity),
                  onMouseLeave: () => setHoveredDay(null),
                })
              }
              labels={{ totalCount: t("{{count}} contributions in the last year") }}
            />
          ) : (
            <a href="https://github.com/taaqib-masood" target="_blank" rel="noopener noreferrer" className="h-[140px] flex items-center font-mono text-[12px] uppercase tracking-widest text-outline hover:text-foreground">
              {t("Contribution graph unavailable right now · view it on GitHub ↗")}
            </a>
          )}
        </div>
      </div>

      {/* Interactive Telemetry HUD Bar */}
      <div className="border-b border-border bg-surface-container-low px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {hoveredDay ? (
            <span className="text-foreground font-semibold flex items-center gap-2">
              <span className="text-outline">{t("DATE:")}</span> {hoveredDay.date}
              <span className="text-outline mx-1">|</span>
              <span className="text-emerald-500 font-bold">{hoveredDay.count} {hoveredDay.count === 1 ? t("contribution") : t("contributions")}</span>
              <span className="text-outline mx-1">|</span>
              <span className="px-1.5 py-0.5 border border-border bg-surface text-[10px] uppercase">
                {hoveredDay.level === 0 ? t("No activity") : `${t("Intensity Lvl")} ${hoveredDay.level}`}
              </span>
            </span>
          ) : (
            <span className="text-outline">
              <strong className="text-foreground">{t("ANNUAL TELEMETRY:")}</strong>{" "}
              {contributions
                ? `${contributions.total.toLocaleString("en-US")} ${t("contributions across")} ${activeDays} ${t("active days. Hover any block to inspect.")}`
                : t("Loading live data from GitHub.")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-outline">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>{t("LIVE FROM GITHUB · REFRESHED HOURLY")}</span>
        </div>
      </div>

      {/* Category Filter Ribbon */}
      <div className="border-b border-border p-4 md:px-8 bg-surface flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-outline" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-outline">{t("FILTER REPOSITORIES:")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "AI & Agents", "Quant & ML", "Full-Stack"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 max-sm:min-h-10 text-[11px] font-mono uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? "bg-foreground text-surface border-foreground font-bold shadow-sm"
                  : "bg-surface text-outline hover:text-foreground border-border hover:border-foreground/50"
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] border-b lg:border-b-0 md:[&:not(:nth-child(2n))]:border-r lg:[&:not(:nth-child(3n))]:border-r border-border bg-surface flex items-center justify-center"
              >
                <Loader2 className="h-6 w-6 text-outline animate-spin" />
              </div>
            ))
          : filteredRepos.map((repo, idx) => (
              <motion.a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className={`group flex flex-col justify-between border-b border-border p-6 md:p-8 bg-surface hover:bg-foreground hover:text-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                  idx % 3 !== 2 ? "lg:border-r" : ""
                } ${
                  idx % 2 !== 1 ? "md:border-r lg:border-r-0" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border border-border group-hover:border-surface/40 text-outline group-hover:text-surface/80">
                      {t(repo.category || "Open Source")}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-outline group-hover:text-surface transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-3 line-clamp-1 group-hover:text-surface transition-colors">
                    {repo.name}
                  </h3>
                  <p className="text-[13px] leading-[1.6] text-outline group-hover:text-surface/70 line-clamp-2 mb-6">
                    {repo.description ? t(repo.description) : "No description available."}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-outline group-hover:text-surface/80">
                  {repo.language && (
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-foreground group-hover:bg-surface" />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count !== null && (
                    <span className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5" />
                      {repo.stargazers_count}
                    </span>
                  )}
                  {repo.forks_count !== null && (
                    <span className="flex items-center gap-2">
                      <GitFork className="h-3.5 w-3.5" />
                      {repo.forks_count}
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
      </div>
    </section>
  );
}
