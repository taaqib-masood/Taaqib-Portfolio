import { ArrowUpRight } from "lucide-react";
import { contact } from "@/data/resume";

// The facts recruiters screen on, answered in ten seconds.
const FACTS = [
  { label: "Role", value: "AI Engineer · Full-stack" },
  { label: "Based", value: "Dubai, UAE" },
  { label: "Work status", value: contact.workStatus },
  { label: "Availability", value: "Immediately" },
  { label: "Languages", value: "English · Hindi · Urdu · Tamil (+ Arabic, Malayalam basic)" },
];

const CTAS = [
  { label: "Download CV", href: "/taaqib-masood-cv.pdf", download: true },
  { label: "Email", href: `mailto:${contact.email}` },
  { label: "WhatsApp", href: "https://wa.me/971501330057?text=Hi%20Taaqib%2C%20I%20reviewed%20your%20portfolio.", external: true },
];

export function QuickFacts() {
  return (
    <section aria-label="Quick facts for recruiters" className="max-w-[1440px] mx-auto border-b border-border">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12">
        {FACTS.map((f, i) => (
          <dl key={f.label} className={`p-5 md:p-6 border-b lg:border-b-0 border-border lg:col-span-2 ${i === 4 ? "col-span-2 md:col-span-2" : ""} ${i < 4 ? "border-r" : "lg:border-r"}`}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant mb-2">{f.label}</dt>
            <dd className="text-[14px] font-semibold leading-[1.4] flex gap-2">
              {/* Cobalt marker instead of cobalt text: #2e5bff on black is too low-contrast for 14px copy. */}
              {f.label === "Work status" && <span aria-hidden="true" className="mt-[5px] h-2 w-2 shrink-0 bg-primary" />}
              {f.value}
            </dd>
          </dl>
        ))}
        <div className="col-span-2 md:col-span-1 lg:col-span-2 grid grid-cols-3 md:grid-cols-1 text-[11px] font-bold uppercase tracking-widest">
          {CTAS.map((c, i) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.download ? { download: true } : {})}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`flex items-center justify-between gap-2 px-4 min-h-12 hover:bg-foreground hover:text-background transition-colors ${i < 2 ? "border-r md:border-r-0 md:border-b border-border" : ""} ${i === 0 ? "bg-foreground text-background hover:bg-primary hover:text-foreground" : ""}`}
            >
              {c.label} <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
