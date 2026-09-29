import type { GithubFeed } from "@/app/api/github/route";

let feed: Promise<GithubFeed> | null = null;

/** One shared request per page load for every component that shows GitHub data. */
export function getGithubFeed(): Promise<GithubFeed> {
  feed ??= fetch("/api/github")
    .then((r) => (r.ok ? (r.json() as Promise<GithubFeed>) : { repos: null, contributions: null }))
    .catch(() => ({ repos: null, contributions: null }));
  return feed;
}
