"use client";

import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { motion } from "framer-motion";
import { Star, GitFork, Loader2 } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

interface Repo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string | null;
  description: string | null;
}

const FALLBACK_REPOS: Repo[] = [
  {
    name: "stock-market-forecasting-risk-analytics",
    stargazers_count: 12,
    forks_count: 4,
    html_url: "https://github.com/taaqib-masood/stock-market-forecasting-risk-analytics",
    language: "Python",
    description: "Predictive modeling and risk analytics using LSTM and Prophet.",
  },
  {
    name: "predictive-maintenance-industrial-machinery",
    stargazers_count: 8,
    forks_count: 2,
    html_url: "https://github.com/taaqib-masood/predictive-maintenance-industrial-machinery",
    language: "Python",
    description: "ML pipeline for industrial predictive maintenance.",
  },
  {
    name: "salon-booking-saas",
    stargazers_count: 15,
    forks_count: 3,
    html_url: "https://github.com/taaqib-masood/salon-booking-saas",
    language: "TypeScript",
    description: "Full-stack booking SaaS built with Next.js.",
  },
  {
    name: "smart-hospital-agent",
    stargazers_count: 9,
    forks_count: 1,
    html_url: "https://github.com/taaqib-masood/smart-hospital-agent",
    language: "TypeScript",
    description: "AI healthcare agent using LangChain and Next.js.",
  },
  {
    name: "agent",
    stargazers_count: 25,
    forks_count: 5,
    html_url: "https://github.com/taaqib-masood/agent",
    language: "Python",
    description: "Agentic system infrastructure.",
  },
  {
    name: "taaqib-masood.github.io",
    stargazers_count: 3,
    forks_count: 0,
    html_url: "https://github.com/taaqib-masood/taaqib-masood.github.io",
    language: "TypeScript",
    description: "My personal portfolio.",
  },
];

export function GithubGraph() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch(
          "https://api.github.com/users/taaqib-masood/repos?sort=stars&per_page=6"
        );
        if (!res.ok) {
          throw new Error("Rate limited or error");
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRepos(data.slice(0, 6));
        } else {
          setRepos(FALLBACK_REPOS);
        }
      } catch (err) {
        console.error("Failed to fetch repos, using fallback", err);
        setRepos(FALLBACK_REPOS);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto border-b border-border">
      
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] flex items-center gap-4">
            <GithubIcon className="h-8 md:h-12 w-8 md:w-12 text-foreground" />
            GitHub
          </h2>
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface-container-low flex flex-col justify-center">
          <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-outline">
            Consistent contributions and open-source projects tracking logic layer developments.
          </p>
        </div>
      </div>

      <div className="border-b border-border p-6 md:p-8 overflow-x-auto flex justify-center bg-surface">
        <div className="min-w-fit pointer-events-none">
          <GitHubCalendar
            username="taaqib-masood"
            colorScheme="light"
            theme={{
              light: ["#f1f5f9", "#cbd5e1", "#94a3b8", "#475569", "#0f172a"],
            }}
            blockSize={14}
            blockMargin={6}
            fontSize={12}
          />
        </div>
      </div>

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
          : repos.map((repo, idx) => (
              <motion.a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`group flex flex-col justify-between border-b border-border p-6 md:p-8 bg-surface hover:bg-foreground hover:text-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                  idx % 3 !== 2 ? "lg:border-r" : ""
                } ${
                  idx % 2 !== 1 ? "md:border-r lg:border-r-0" : ""
                } ${
                  idx >= repos.length - (repos.length % 3 || 3) ? "lg:border-b-0" : ""
                } ${
                  idx >= repos.length - (repos.length % 2 || 2) ? "md:border-b-0 lg:border-b" : ""
                }`}
              >
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-widest mb-4 line-clamp-1 group-hover:text-surface transition-colors">
                    {repo.name}
                  </h3>
                  <p className="text-[14px] leading-[1.6] text-outline group-hover:text-surface/70 line-clamp-2 mb-6">
                    {repo.description || "No description available."}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-outline group-hover:text-surface/80">
                  {repo.language && (
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-foreground group-hover:bg-surface" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-2">
                    <GitFork className="h-3.5 w-3.5" />
                    {repo.forks_count}
                  </span>
                </div>
              </motion.a>
            ))}
      </div>
    </section>
  );
}
