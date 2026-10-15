import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/github/route.ts", import.meta.url), "utf8");
const component = readFileSync(new URL("../src/components/GithubGraph.tsx", import.meta.url), "utf8");
const trackedBlock = route.match(/const TRACKED_REPOS = new Set\(\[([\s\S]*?)\]\);/)?.[1];
const fallbackBlock = component.match(/const FALLBACK_REPOS: Repo\[\] = \[([\s\S]*?)\n\];/)?.[1];

assert.ok(trackedBlock && fallbackBlock, "GitHub repo lists are present");
assert.deepEqual(
  [...trackedBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort(),
  [...fallbackBlock.matchAll(/name: "([^"]+)"/g)].map((match) => match[1].toLowerCase()).sort(),
  "API payload includes exactly the repos shown by the GitHub widget",
);
assert.match(route, /export const revalidate = 21600;/, "server fetches revalidate every six hours");
assert.match(route, /s-maxage=21600, stale-while-revalidate=3600/, "CDN cache uses the same freshness window");
assert.doesNotMatch(route, /pushedAt/, "unused pushedAt values are excluded from the cache payload");
console.log("PASS: GitHub ISR windows and cached payload match the widget's needs");
