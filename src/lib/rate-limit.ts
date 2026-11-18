// Rate limiter for the AI and email routes. Counters live in Upstash Redis (REST API) when
// configured, so every instance shares one count; otherwise in bounded per-instance memory.

type Entry = { count: number; resetAt: number };
type Result = { allowed: boolean; remaining: number; resetAt: number };

const buckets = new Map<string, Entry>();
const MAX_BUCKETS = 10_000; // hard cap so attackers can't balloon memory with spoofed IPs
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function evict(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt < now) buckets.delete(key);
  }
  // Still over cap? Drop oldest-inserted (Map preserves insertion order).
  let excess = buckets.size - MAX_BUCKETS;
  if (excess > 0) {
    for (const key of buckets.keys()) {
      if (excess-- <= 0) break;
      buckets.delete(key);
    }
  }
}

function memoryCount(key: string, windowMs: number, now: number): Entry {
  evict(now);
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    const fresh = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return fresh;
  }
  entry.count++;
  return entry;
}

// Fixed-window counter shared by all instances. Null when unconfigured or unreachable.
async function sharedCount(key: string, windowMs: number, now: number): Promise<Entry | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["SET", `rl:${key}`, "0", "PX", String(windowMs), "NX"],
        ["INCR", `rl:${key}`],
        ["PTTL", `rl:${key}`],
      ]),
    });
    if (!res.ok) return null;
    const [, incr, ttl] = (await res.json()) as { result?: unknown }[];
    if (typeof incr?.result !== "number") return null;
    const ms = typeof ttl?.result === "number" && ttl.result > 0 ? ttl.result : windowMs;
    return { count: incr.result, resetAt: now + ms };
  } catch {
    return null;
  }
}

export async function rateLimit(key: string, max: number, windowMs: number): Promise<Result> {
  const now = Date.now();
  // shortcut: a Redis outage falls back to per-instance counts, which is weaker but keeps the site up.
  const { count, resetAt } = (await sharedCount(key, windowMs, now)) ?? memoryCount(key, windowMs, now);
  return { allowed: count <= max, remaining: Math.max(0, max - count), resetAt };
}

// Per-visitor hourly limit, then a daily budget for the whole route, so many addresses
// together still can't exceed a known Groq/Resend spend.
export async function limitRoute(route: string, req: Request, perHour: number, perDay: number): Promise<Result> {
  const visitor = await rateLimit(`${route}:${getClientIp(req)}`, perHour, HOUR);
  if (!visitor.allowed) return visitor;
  const global = await rateLimit(`daily:${route}`, perDay, DAY);
  return global.allowed ? visitor : global;
}

// IPv6 clients get a whole /64 each (one subscriber line), so rotating addresses inside it doesn't reset the count.
function ipKey(ip: string): string {
  const v4 = ip.match(/^(?:::ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (v4) return v4[1];
  if (!ip.includes(":")) return ip;
  const [head, tail] = ip.split("%")[0].split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const groups = [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t];
  return groups.slice(0, 4).map((g) => parseInt(g || "0", 16).toString(16)).join(":") + "::/64";
}

export function getClientIp(req: Request): string {
  // ponytail: Outside Vercel all visitors share one quota; configure trusted ingress before enabling per-client IP limits.
  if (process.env.VERCEL !== "1") return "anonymous";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip");
  return ip ? ipKey(ip) : "anonymous";
}
