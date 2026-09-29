import assert from "node:assert/strict";
import { projects } from "../src/data/projects.ts";
import { caseStudies } from "../src/data/case-studies.ts";
import { readFileSync, readdirSync } from "node:fs";
import { ar } from "../src/data/ar.ts";
import * as resume from "../src/data/resume.ts";
import path from "node:path";

for (const p of projects) {
  const c = caseStudies[p.slug];
  assert.ok(c, `${p.slug} has a case study (else /projects/${p.slug} 404s and Plain-English mode falls back)`);
  for (const k of ["plain", "problem", "built", "result"]) assert.ok(c[k]?.trim().length > 20, `${p.slug}.${k} is filled`);
  assert.ok(c.architecture.length >= 3 && c.decisions.length >= 2, `${p.slug} has an architecture and decisions`);
}
assert.equal(Object.keys(caseStudies).length, projects.length, "no orphan case studies");
assert.ok(!JSON.stringify({ projects, caseStudies }).match(/comfotec|recruitment-tech/i), "private Comfotec work stays out");
// Arabic version: every project, case-study and resume string has a hand-written translation,
// so editing English copy without updating src/data/ar.ts fails here instead of silently showing English.
const strings = [
  ...projects.flatMap((p) => [p.title, p.blurb, p.role, ...p.metrics, ...p.categories]),
  ...Object.values(caseStudies).flatMap((c) => [c.plain, c.problem, c.built, c.result, ...c.architecture.map((a) => a.detail), ...c.decisions]),
  ...resume.aboutParagraphs, ...resume.certifications, resume.spokenLanguages, ...Object.keys(resume.skills),
  ...resume.experience.flatMap((e) => [e.role, e.company, e.period, e.location, ...e.bullets]),
  ...resume.education.flatMap((e) => [e.institution, e.degree, e.detail]),
];
const untranslated = [...new Set(strings)].filter((s) => !ar[s]);
assert.deepEqual(untranslated, [], "every data string has an Arabic translation in src/data/ar.ts");

// No em dashes anywhere in the site's source. The one allowed line is the agent's instruction not to use them.
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const dashes = walk("src").filter((f) => /\.(tsx?|css)$/.test(f)).flatMap((f) =>
  readFileSync(f, "utf8").split("\n").map((line, i) => [f, i + 1, line]).filter(([, , line]) => line.includes("\u2014") && !line.includes("Never use em dashes")));
assert.deepEqual(dashes.map(([f, n]) => `${f}:${n}`), [], "no em dashes in the site");
console.log(`PASS: Arabic covers all ${new Set(strings).size} data strings; no em dashes; ${projects.length} projects each have a complete case study; no private repo content`);
