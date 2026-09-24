import assert from 'node:assert/strict';
import { layoutProjects, stackLinks, matchesSkill, CLUSTER_RADIUS } from '../src/lib/embedding.ts';

const p = (slug, categories, stack) => ({ slug, categories, stack });
// Same categories on purpose: identical anchors must still separate.
const projects = [
  p('a', ['AI/LLM', 'Full-Stack'], ['Groq', 'Next.js', 'Supabase']),
  p('b', ['AI/LLM', 'Full-Stack'], ['Groq', 'Next.js']),
  p('c', ['AI/LLM'], ['Claude', 'Python']),
  p('d', ['ML', 'Edge'], ['TensorFlow Lite', 'Python']),
  p('e', ['ML'], ['LightGBM', 'Python']),
];
const centers = layoutProjects(projects);
for (let i = 0; i < centers.length; i++)
  for (let j = i + 1; j < centers.length; j++)
    assert.ok(Math.hypot(...centers[i].map((v, k) => v - centers[j][k])) >= CLUSTER_RADIUS * 3, `clusters ${i} and ${j} overlap`);
assert.deepEqual(layoutProjects(projects), centers, 'layout is deterministic');
assert.deepEqual(stackLinks(projects), [[0, 1]]);
assert.deepEqual(projects.filter((x) => matchesSkill(x, 'Python')).map((x) => x.slug), ['c', 'd', 'e']);
assert.equal(projects.filter((x) => matchesSkill(x, null)).length, projects.length);
console.log('PASS: clusters never overlap, layout deterministic, stack links, skill query');
