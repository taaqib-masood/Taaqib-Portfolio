import { NextResponse } from "next/server";

// Live GitHub feed for the portfolio. Fetched server-side so the browser never talks to
// third-party APIs (tighter CSP), cached at the edge so visitors share one upstream call.
export const revalidate = 3600;

const USER = "taaqib-masood";
const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

export type GithubFeed = {
  repos: { name: string; stars: number; forks: number; language: string | null; pushedAt: string }[] | null;
  contributions: { total: number; days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] } | null;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");

async function getJson(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers, next: { revalidate }, signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<unknown>;
}

async function repos(): Promise<GithubFeed["repos"]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const data = await getJson(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner`, headers);
  if (!Array.isArray(data)) return null;
  // Public, non-fork repos only: never leak private repo names even if the token could see them.
  return data
    .filter((r) => r && !r.private && !r.fork)
    .map((r) => ({ name: str(r.name), stars: num(r.stargazers_count), forks: num(r.forks_count), language: r.language ? str(r.language) : null, pushedAt: str(r.pushed_at) }));
}

const LEVELS: Record<string, 0 | 1 | 2 | 3 | 4> = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

// With the owner's token, GitHub's own calendar counts private-repo work too (as bare numbers,
// never repo names), so the total matches the profile page. Without one, fall back to the public scraper.
async function contributionsFromGraphql(token: string): Promise<GithubFeed["contributions"]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`,
      variables: { login: USER },
    }),
    next: { revalidate },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`graphql → ${res.status}`);
  const cal = (await res.json())?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal || !Array.isArray(cal.weeks)) throw new Error("graphql: no calendar");
  const days = cal.weeks
    .flatMap((w: { contributionDays?: unknown }) => (Array.isArray(w?.contributionDays) ? w.contributionDays : []))
    .filter((d: { date?: unknown }) => typeof d?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
    .map((d: { date: string; contributionCount?: unknown; contributionLevel?: unknown }) => ({
      date: d.date, count: num(d.contributionCount), level: LEVELS[str(d.contributionLevel)] ?? 0,
    }));
  return { total: num(cal.totalContributions), days };
}

async function contributions(): Promise<GithubFeed["contributions"]> {
  if (process.env.GITHUB_TOKEN) {
    try { return await contributionsFromGraphql(process.env.GITHUB_TOKEN); } catch { /* fall through to the public source */ }
  }
  const data = (await getJson(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`)) as {
    total?: { lastYear?: unknown };
    contributions?: { date?: unknown; count?: unknown; level?: unknown }[];
  };
  if (!Array.isArray(data.contributions)) return null;
  const days = data.contributions
    .filter((d) => typeof d.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
    .map((d) => ({ date: d.date as string, count: num(d.count), level: Math.min(4, Math.floor(num(d.level))) as 0 | 1 | 2 | 3 | 4 }));
  return { total: num(data.total?.lastYear) || days.reduce((s, d) => s + d.count, 0), days };
}

export async function GET() {
  // Each half fails independently: a contributions outage must not hide repo stats, and vice versa.
  const [r, c] = await Promise.allSettled([repos(), contributions()]);
  const body: GithubFeed = {
    repos: r.status === "fulfilled" ? r.value : null,
    contributions: c.status === "fulfilled" ? c.value : null,
  };
  return NextResponse.json(body, { headers: { "Cache-Control": CACHE } });
}
