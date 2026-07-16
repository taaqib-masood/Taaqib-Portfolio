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
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center"
      >
        <h2 className="font-heading text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <GithubIcon className="h-8 w-8 text-slate-300" />
          Live GitHub Activity
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Consistent contributions and open-source projects.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 , ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-8 mb-8 overflow-x-auto flex justify-center"
      >
        <div className="min-w-fit">
          <GitHubCalendar
            username="taaqib-masood"
            colorScheme="dark"
            theme={{
              dark: ["#1e1e24", "#372c5e", "#563899", "#784ad1", "#a16fff"],
            }}
            blockSize={12}
            blockMargin={4}
            fontSize={12}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[140px] rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse flex items-center justify-center"
              >
                <Loader2 className="h-6 w-6 text-slate-700 animate-spin" />
              </div>
            ))
          : repos.map((repo, idx) => (
              <motion.a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 , ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-violet-500/50 hover:bg-slate-800/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <div>
                  <h3 className="font-semibold text-slate-200 group-hover:text-violet-400 transition-colors mb-2 line-clamp-1">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {repo.description || "No description available."}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
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
