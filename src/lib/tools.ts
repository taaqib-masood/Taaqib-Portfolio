import { tool } from "ai";
import { z } from "zod";
import { projects, githubRepos } from "@/data/projects";
import {
  aboutParagraphs,
  skills,
  experience,
  education,
  certifications,
  spokenLanguages,
  contact,
} from "@/data/resume";

/** Cached fallback for when GitHub rate limits or for instantaneous response. */
const GITHUB_FALLBACK = {
  note: "Cached profile statistics for Taaqib Masood (github.com/taaqib-masood) plus open-source contributions",
  publicRepos: 10,
  totalStars: 64,
  followers: 5,
  contributions: 569,
  topRepos: [
    { name: "smart-hospital-agent", title: "Reva AI — WhatsApp Receptionist", stars: 12, language: "TypeScript" },
    { name: "stock-market-forecasting-risk-analytics", title: "Stock Market Forecasting & Risk Analytics", stars: 15, language: "Python" },
    { name: "predictive-maintenance-industrial-machinery", title: "Predictive Maintenance of Industrial Machinery", stars: 10, language: "Python" },
    { name: "salon-booking-saas", title: "Salon Booking SaaS (UAE)", stars: 18, language: "TypeScript" },
    { name: "atlas-ai", title: "Atlas AI — Autonomous Multi-Agent System", stars: 7, language: "JavaScript" },
    { name: "garageIQ-landing-page", title: "GarageIQ Workshop Platform", stars: 2, language: "CSS" },
    { name: "majestic-constructions", title: "Majestic Constructions Portal", stars: 0, language: "TypeScript" },
    { name: "Taaqib-Portfolio", title: "Swiss Brutalist Portfolio with Agent Terminal", stars: 0, language: "TypeScript" },
    { name: "graphify", title: "Graphify — Codebase Knowledge Graph (Graphify-Labs)", stars: 0, language: "Python", url: "https://github.com/Graphify-Labs/graphify" },
    { name: "ponytail", title: "Ponytail — Lazy Senior Dev AI Rules (DietrichGebert)", stars: 0, language: "JavaScript", url: "https://github.com/DietrichGebert/ponytail" },
  ],
};

let cachedGithubData: { payload: string; timestamp: number } | null = null;
const GITHUB_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const tools = {
  get_project: tool({
    description:
      "Fetch detailed information about any of Taaqib's portfolio or GitHub projects. Accepts any slug, alias, or title, including 'reva-ai', 'smart-hospital-agent', 'ltts-proctoring-portal', 'mcp-code-review-pipeline', 'stock-forecasting-risk', 'salon-booking-saas', 'predictive-maintenance', 'atlas-ai', 'garageiq', 'graphify', 'ponytail', etc.",
    parameters: z.object({
      slug: z
        .string()
        .describe(
          "Project slug, alias, or title (e.g. 'reva-ai', 'smart-hospital-agent', 'ltts', 'mcp', 'stock', 'salon', 'predictive-maintenance', 'atlas', 'graphify', 'ponytail')"
        ),
    }),
    // @ts-expect-error - AI SDK v6 / Zod v4 TS inference mismatch
    execute: async (params: { slug?: string; project?: string; project_name?: string; name?: string }): Promise<string> => {
      const rawSlug = params?.slug || params?.project || params?.project_name || params?.name;
      if (!rawSlug) {
        return JSON.stringify({ error: "Missing slug parameter", availableSlugs: projects.map((p) => p.slug) });
      }
      const query = rawSlug.toLowerCase().trim().replace(/[-_]/g, " ");

      // 1. Direct match or alias match against featured projects
      const project = projects.find((p) => {
        const slugNorm = p.slug.toLowerCase().replace(/[-_]/g, " ");
        const titleNorm = p.title.toLowerCase();
        if (slugNorm === query || titleNorm === query) return true;
        if (p.aliases && p.aliases.some((a) => a.toLowerCase().replace(/[-_]/g, " ") === query)) return true;
        if (query.includes(slugNorm) || slugNorm.includes(query)) return true;
        if (query.includes("reva") && (slugNorm.includes("hospital") || titleNorm.includes("reva"))) return true;
        if (query.includes("whatsapp") && (slugNorm.includes("hospital") || titleNorm.includes("whatsapp"))) return true;
        if (query.includes("ltts") && slugNorm.includes("ltts")) return true;
        if (query.includes("mcp") && slugNorm.includes("mcp")) return true;
        if (query.includes("stock") && slugNorm.includes("stock")) return true;
        if (query.includes("salon") && slugNorm.includes("salon")) return true;
        if ((query.includes("predictive") || query.includes("machinery") || query.includes("turbofan")) && slugNorm.includes("predictive")) return true;
        return false;
      });

      if (project) {
        return JSON.stringify({
          title: project.title,
          slug: project.slug,
          blurb: project.blurb,
          stack: project.stack,
          metrics: project.metrics,
          highlights: project.highlights || [],
          role: project.role,
          repo: project.repo,
          demo: project.demo,
          categories: project.categories,
        });
      }

      // 2. Check githubRepos array for additional projects/repos
      const repo = githubRepos.find((r) => {
        const nameNorm = r.name.toLowerCase().replace(/[-_]/g, " ");
        const titleNorm = r.title.toLowerCase();
        return (
          nameNorm === query ||
          titleNorm === query ||
          nameNorm.includes(query) ||
          query.includes(nameNorm) ||
          titleNorm.includes(query)
        );
      });

      if (repo) {
        return JSON.stringify({
          title: repo.title,
          slug: repo.name,
          blurb: repo.description,
          language: repo.language,
          category: repo.category,
          repo: repo.url,
          highlights: repo.highlights,
          source: "GitHub Repository",
        });
      }

      // 3. Fallback: return list of all projects so LLM can guide the user
      return JSON.stringify({
        error: `Project '${rawSlug}' not found. Available projects: ${projects.map((p) => p.title).join(", ")}.`,
        availableProjects: projects.map((p) => ({ title: p.title, slug: p.slug })),
        githubRepos: githubRepos.map((r) => ({ title: r.title, repo: r.name })),
      });
    },
  }),

  get_resume_section: tool({
    description:
      "Fetch a specific section of Taaqib's resume.",
    parameters: z.object({
      section: z
        .enum([
          "about",
          "skills",
          "experience",
          "education",
          "certifications",
          "contact",
          "languages",
        ])
        .describe("The resume section to fetch"),
    }),
    // @ts-expect-error - AI SDK v6 / Zod v4 TS inference mismatch
    execute: async (params: {
      section:
        | "about"
        | "skills"
        | "experience"
        | "education"
        | "certifications"
        | "contact"
        | "languages"
        | null;
    }): Promise<string> => {
      if (!params || !params.section) {
        return JSON.stringify({ error: "Missing section parameter" });
      }
      const sectionMap: Record<string, unknown> = {
        about: aboutParagraphs,
        skills,
        experience,
        education,
        certifications,
        contact,
        languages: spokenLanguages,
      };
      return JSON.stringify(sectionMap[params.section] ?? "Section not found");
    },
  }),

  get_github_stats: tool({
    description: "Fetch Taaqib's live GitHub statistics.",
    parameters: z.object({}),
    // @ts-expect-error - AI SDK v6 / Zod v4 TS inference mismatch
    execute: async (): Promise<string> => {
      // Check in-memory cache first for sub-1ms response
      if (cachedGithubData && Date.now() - cachedGithubData.timestamp < GITHUB_CACHE_TTL) {
        return cachedGithubData.payload;
      }

      try {
        const headers: Record<string, string> = {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        };
        const token = process.env.GITHUB_TOKEN as string | undefined;
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // 2500ms timeout so GitHub latency never blocks the LLM response
        const timeoutSignal = AbortSignal.timeout(2500);

        const [userRes, reposRes] = await Promise.all([
          fetch("https://api.github.com/users/taaqib-masood", { headers, signal: timeoutSignal }),
          fetch(
            "https://api.github.com/users/taaqib-masood/repos?per_page=10&sort=updated",
            { headers, signal: timeoutSignal }
          ),
        ]);

        if (!userRes.ok || !reposRes.ok) {
          return JSON.stringify(GITHUB_FALLBACK);
        }

        const user = (await userRes.json()) as {
          public_repos: number;
          followers: number;
        };
        const repos = (await reposRes.json()) as Array<{
          name: string;
          stargazers_count: number;
          language: string | null;
        }>;

        const totalStars = repos.reduce(
          (acc, r) => acc + r.stargazers_count,
          0
        );

        const payload = JSON.stringify({
          publicRepos: user.public_repos,
          followers: user.followers,
          totalStars,
          contributions: 569, // REST API does not expose contribution count; use known value
          topRepos: repos.map((r) => ({
            name: r.name,
            stars: r.stargazers_count,
            language: r.language,
          })),
        });

        cachedGithubData = { payload, timestamp: Date.now() };
        return payload;
      } catch {
        return JSON.stringify(GITHUB_FALLBACK);
      }
    },
  }),

  get_live_demo: tool({
    description: "Get the live demo URL for a project that has one deployed.",
    parameters: z.object({
      slug: z.string().describe("Project slug, alias, or title (e.g. 'stocks', 'stock-forecasting-risk')"),
    }),
    // @ts-expect-error - AI SDK v6 / Zod v4 TS inference mismatch
    execute: async (params: { slug: string | null }): Promise<string> => {
      if (!params || !params.slug) return JSON.stringify({ error: "Missing slug parameter" });
      const query = params.slug.toLowerCase().trim().replace(/[-_]/g, " ");

      const project = projects.find((p) => {
        const slugNorm = p.slug.toLowerCase().replace(/[-_]/g, " ");
        const titleNorm = p.title.toLowerCase();
        if (slugNorm === query || titleNorm === query) return true;
        if (p.aliases && p.aliases.some((a) => a.toLowerCase().replace(/[-_]/g, " ") === query)) return true;
        if (query.includes(slugNorm) || slugNorm.includes(query)) return true;
        if (query.includes("stock") && slugNorm.includes("stock")) return true;
        return false;
      });

      if (!project) return JSON.stringify({ error: `Project '${params.slug}' not found` });
      if (!project.demo)
        return JSON.stringify({
          message: `No public web demo currently deployed for ${project.title}. Source code available on GitHub: ${project.repo}`,
          slug: project.slug,
          repo: project.repo,
        });
      return JSON.stringify({ slug: project.slug, title: project.title, demoUrl: project.demo });
    },
  }),
};
