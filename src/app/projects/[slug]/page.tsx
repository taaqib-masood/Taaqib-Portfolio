import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { projects } from "@/data/projects";
import { caseStudies } from "@/data/case-studies";
import { AudienceToggle } from "@/components/AudienceToggle";
import { TechDetails } from "@/components/TechDetails";

type Params = { params: Promise<{ slug: string }> };

const find = (slug: string) => {
  const project = projects.find((p) => p.slug === slug);
  const study = caseStudies[slug];
  return project && study ? { project, study } : null;
};

// Rendered per request, like the home page: the nonce-based CSP needs a fresh nonce on every
// response, and prerendered HTML has none, so its scripts would be blocked and never hydrate.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = find((await params).slug);
  if (!found) return {};
  const title = `${found.project.title} · Case study · Taaqib Masood`;
  return {
    title,
    description: found.study.plain,
    alternates: { canonical: `/projects/${found.project.slug}` },
    openGraph: { title, description: found.study.plain, type: "article" },
    twitter: { card: "summary_large_image", title, description: found.study.plain },
  };
}

// Stages naming a model get the accent, so the AI's place in the pipeline is visible at a glance.
const AI_STAGE = /groq|claude|gemini|llama|lightgbm|lstm|meta-controller|recommender/i;

export default async function CaseStudyPage({ params }: Params) {
  const found = find((await params).slug);
  if (!found) notFound();
  const { project, study } = found;
  const year = project.role.match(/20\d\d/g)?.at(-1);
  const demoLabel = project.demo?.includes("loom.com") ? "Watch demo" : "Open live app";
  const publicRepo = project.repo !== "https://github.com/taaqib-masood";
  // GarageIQ's product code is private; its public repo is only the marketing site.
  const repoLabel = project.repo.includes("landing-page") ? "Marketing-site source" : "Source on GitHub";

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <AudienceToggle />
      <nav className="max-w-[1440px] mx-auto border-b border-border px-6 md:px-8 h-16 flex items-center">
        <Link href="/#projects" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Taaqib Masood · All projects
        </Link>
      </nav>

      <article className="max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
          <div className="lg:col-span-8 p-6 md:p-12 lg:border-r border-border">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant mb-6">
              Case study · {project.categories.join(" · ")}{year ? ` · ${year}` : ""}
            </p>
            <h1 className="text-[40px] md:text-[80px] font-black uppercase leading-[0.92] tracking-[-0.04em]">{project.title}</h1>
            <p className="mt-8 text-[18px] md:text-[22px] leading-[1.45] max-w-[46ch]">{study.plain}</p>
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <div className="p-6 md:p-8 border-b border-border">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant mb-2">Role</p>
              <p className="text-[15px] font-semibold">{project.role}</p>
            </div>
            <div className="flex flex-col text-[12px] font-bold uppercase tracking-widest mt-auto">
              {project.demo ? (
                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-6 md:px-8 min-h-14 bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors">
                  {demoLabel} <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : (
                <p className="flex items-center px-6 md:px-8 min-h-14 border-b border-border text-on-surface-variant">Demo on request</p>
              )}
              {publicRepo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-6 md:px-8 min-h-14 border-t border-border hover:bg-foreground hover:text-background transition-colors">
                  {repoLabel} <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <Link href={`/?ask=${project.slug}#agent`} className="flex items-center justify-between px-6 md:px-8 min-h-14 border-t border-border hover:bg-foreground hover:text-background transition-colors">
                Ask my AI agent about this <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Problem → Built → Result: readable by anyone */}
        <section aria-label="Summary" className="grid grid-cols-1 md:grid-cols-3 border-b border-border">
          {([["01", "The problem", study.problem], ["02", "What I built", study.built], ["03", "The result", study.result]] as const).map(([n, h, body], i) => (
            <div key={n} className={`p-6 md:p-8 ${i < 2 ? "border-b md:border-b-0 md:border-r border-border" : ""} ${i === 2 ? "bg-surface-container-low" : ""}`}>
              <p className="font-mono text-[11px] text-on-surface-variant mb-4">{n}</p>
              <h2 className="text-[20px] md:text-[24px] font-bold uppercase tracking-[-0.02em] mb-4">{h}</h2>
              <p className="text-[16px] leading-[1.65] text-[#d4d6e0]">{body}</p>
            </div>
          ))}
        </section>

        {/* Metrics */}
        <section aria-label="Key numbers" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-border">
          {project.metrics.slice(0, 4).map((m, i) => (
            <p key={i} className="p-6 md:p-8 border-b lg:border-b-0 sm:odd:border-r lg:border-r border-border text-[15px] font-semibold leading-[1.45]">
              <span className="block w-2 h-2 bg-primary mb-4" />
              {m}
            </p>
          ))}
        </section>

        <TechDetails>
          {/* Architecture */}
          <section aria-labelledby="arch" className="border-b border-border p-6 md:p-8">
            <h2 id="arch" className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant mb-6">Architecture · how data flows</h2>
            <ol className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-0">
              {study.architecture.map((s, i) => (
                <li key={s.stage} className="flex flex-col lg:flex-row lg:items-center flex-1 min-w-0">
                  <div className={`flex-1 border p-4 min-h-[112px] flex flex-col justify-between ${AI_STAGE.test(s.stage) ? "border-primary bg-primary text-foreground" : "border-border"}`}>
                    <span className="font-mono text-[10px] opacity-70">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-[14px] font-bold uppercase tracking-[-0.01em] leading-[1.2]">{s.stage}</p>
                      <p className="font-mono text-[11px] leading-[1.4] mt-1 opacity-80">{s.detail}</p>
                    </div>
                  </div>
                  {i < study.architecture.length - 1 && (
                    <span aria-hidden="true" className="self-center font-mono text-on-surface-variant py-1 lg:px-2">
                      <span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {/* Decisions + stack */}
          <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
            <div className="lg:col-span-8 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant mb-6">Key engineering decisions</h2>
              <ol className="space-y-5">
                {study.decisions.map((d, i) => (
                  <li key={i} className="grid grid-cols-[40px_1fr] gap-2 text-[16px] leading-[1.6]">
                    <span className="font-mono text-[12px] text-primary pt-1">{String(i + 1).padStart(2, "0")}</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="lg:col-span-4 p-6 md:p-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant mb-6">Stack</h2>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((t) => (
                  <li key={t} className="px-3 py-1.5 border border-border text-[11px] font-semibold uppercase tracking-wider">{t}</li>
                ))}
              </ul>
            </div>
          </section>
        </TechDetails>

        {/* Next steps for the reader */}
        <footer className="grid grid-cols-1 md:grid-cols-2">
          <Link href="/#projects" className="p-6 md:p-8 md:border-r border-b md:border-b-0 border-border text-[14px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">
            ← All projects
          </Link>
          <Link href="/#contact" className="p-6 md:p-8 text-[14px] font-bold uppercase tracking-widest bg-primary hover:bg-foreground hover:text-background transition-colors flex justify-between">
            Talk to Taaqib <ArrowUpRight className="h-5 w-5" />
          </Link>
        </footer>
      </article>
    </main>
  );
}
