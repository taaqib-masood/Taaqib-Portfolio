import assert from "node:assert/strict";
import { projects } from "../src/data/projects.ts";
import { caseStudies } from "../src/data/case-studies.ts";

for (const p of projects) {
  const c = caseStudies[p.slug];
  assert.ok(c, `${p.slug} has a case study (else /projects/${p.slug} 404s and Plain-English mode falls back)`);
  for (const k of ["plain", "problem", "built", "result"]) assert.ok(c[k]?.trim().length > 20, `${p.slug}.${k} is filled`);
  assert.ok(c.architecture.length >= 3 && c.decisions.length >= 2, `${p.slug} has an architecture and decisions`);
}
assert.equal(Object.keys(caseStudies).length, projects.length, "no orphan case studies");
assert.ok(!JSON.stringify({ projects, caseStudies }).match(/comfotec|recruitment-tech/i), "private Comfotec work stays out");
console.log(`PASS: ${projects.length} projects each have a complete case study; no private repo content`);
