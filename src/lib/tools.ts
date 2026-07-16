import { tool } from "ai";
import { z } from "zod";
import { projects } from "@/data/projects";
import {
  aboutParagraphs,
  skills,
  experience,
  education,
  certifications,
  spokenLanguages,
  contact,
} from "@/data/resume";

/** Cached fallback for when GitHub rate limits. */
const GITHUB_FALLBACK = {
  note: "Cached fallback (GitHub API rate limited or no token provided)",
  publicRepos: 6,
  totalStars: 58,
  followers: 0,
  contributions: 569,
  topRepos: [
    { name: "stock-market-forecasting-risk-analytics", stars: 0, language: "Python" },
    { name: "predictive-maintenance-industrial-machinery", stars: 0, language: "Python" },
    { name: "salon-booking-saas", stars: 0, language: "TypeScript" },
    { name: "smart-hospital-agent", stars: 0, language: "TypeScript" },
    { name: "agent", stars: 0, language: "Python" },
    { name: "taaqib-masood.github.io", stars: 0, language: "HTML" },
  ],
};

export const tools = {
  get_project: tool({
    description:
      "Fetch detailed information about a specific project from Taaqib's portfolio.",
    parameters: z.object({
      slug: z
        .string()
        .describe(
          "Project slug — one of: 'ltts-proctoring-portal', 'mcp-code-review-pipeline', 'stock-forecasting-risk', 'salon-booking-saas', 'predictive-maintenance', 'smart-hospital-agent'"
        ),
    }),
    // @ts-expect-error - AI SDK v6 / Zod v4 TS inference mismatch
    execute: async (params: { slug: string }): Promise<string> => {
      const project = projects.find((p) => p.slug === params.slug);
      if (!project) {
        return JSON.stringify({
          error: "Project not found",
          availableSlugs: projects.map((p) => p.slug),
        });
      }
      return JSON.stringify({
        title: project.title,
        blurb: project.blurb,
        stack: project.stack,
        metrics: project.metrics,
        role: project.role,
        repo: project.repo,
        demo: project.demo,
        categories: project.categories,
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
        | "languages";
    }): Promise<string> => {
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
      try {
        const headers: Record<string, string> = {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        };
        const token = process.env.GITHUB_TOKEN as string | undefined;
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [userRes, reposRes] = await Promise.all([
          fetch("https://api.github.com/users/taaqib-masood", { headers }),
          fetch(
            "https://api.github.com/users/taaqib-masood/repos?per_page=6&sort=updated",
            { headers }
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

        return JSON.stringify({
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
      } catch {
        return JSON.stringify(GITHUB_FALLBACK);
      }
    },
  }),

  get_live_demo: tool({
    description: "Get the live demo URL for a project that has one deployed.",
    parameters: z.object({
      slug: z.string().describe("Project slug"),
    }),
    // @ts-expect-error - AI SDK v6 / Zod v4 TS inference mismatch
    execute: async (params: { slug: string }): Promise<string> => {
      const project = projects.find((p) => p.slug === params.slug);
      if (!project) return JSON.stringify({ error: "Project not found" });
      if (!project.demo)
        return JSON.stringify({
          message: "No demo available for this project",
          slug: params.slug,
        });
      return JSON.stringify({ slug: params.slug, demoUrl: project.demo });
    },
  }),
};
