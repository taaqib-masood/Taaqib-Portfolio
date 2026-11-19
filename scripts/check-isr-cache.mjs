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
assert.match(route, /export const dynamic = "force-dynamic";/, "the route response cache is controlled per response");
assert.doesNotMatch(route, /export const revalidate/, "a degraded response cannot inherit a six-hour route ISR window");
assert.match(route, /const SUCCESS_CACHE = "public, s-maxage=21600, stale-while-revalidate=3600";/, "healthy feed data stays fresh for six hours");
assert.match(route, /const DEGRADED_CACHE = "public, s-maxage=60, stale-while-revalidate=300";/, "failed upstream data uses a short cache window");
assert.match(route, /Vercel-CDN-Cache-Control/, "Vercel receives the explicit per-response cache policy");
assert.match(route, /const complete = r\.status === "fulfilled" && r\.value !== null && c\.status === "fulfilled" && c\.value !== null;/, "partial and failed upstream results are classified as degraded");
assert.match(route, /unstable_cache\(repos, \["github-feed-repos"\], \{ revalidate: FEED_TTL \}\)/, "repo stats share one upstream call per TTL regardless of query string");
assert.match(route, /unstable_cache\(contributions, \["github-feed-contributions"\], \{ revalidate: FEED_TTL \}\)/, "contributions share one upstream call per TTL regardless of query string");
assert.match(route, /Promise\.allSettled\(\[cachedRepos\(\), cachedContributions\(\)\]\)/, "the handler only reads upstream data through the data cache");
assert.doesNotMatch(route, /return null;/, "bad upstream payloads throw so they are never cached for six hours");
assert.match(route, /rateLimit\(`github:\$\{getClientIp\(req\)\}`/, "per-IP throttle backs up the data cache");
assert.doesNotMatch(route, /pushedAt/, "unused pushedAt values are excluded from the cache payload");
console.log("PASS: GitHub CDN cache policy shortens degraded responses and preserves healthy freshness");
