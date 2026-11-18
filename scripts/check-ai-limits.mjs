// Run offline with: node scripts/check-ai-limits.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const root = path.resolve(process.argv[2] || ".");
const require = createRequire(path.join(root, "package.json"));
const ts = require("typescript");
const cache = new Map();
const runtimeEnv = { GROQ_API_KEY: "synthetic-unused", NODE_ENV: "test" };
const requests = [];
let failOnce = false;
let failStatus = 503;
let replyWithTool = false;
const redis = new Map();
let redisCalls = 0;
const fakeFetch = async (url, options) => {
  if (new URL(String(url)).hostname === "redis.fixture.invalid") {
    redisCalls++;
    return Response.json(JSON.parse(options.body).map(([cmd, key]) => {
      if (cmd === "SET") return { result: redis.has(key) ? null : (redis.set(key, 0), "OK") };
      if (cmd === "INCR") { redis.set(key, redis.get(key) + 1); return { result: redis.get(key) }; }
      return { result: 1000 };
    }));
  }
  assert.equal(new URL(String(url)).hostname, "api.groq.com");
  requests.push(JSON.parse(options.body));
  if (failOnce) {
    failOnce = false;
    return new Response(JSON.stringify({ error: { message: "Synthetic retry" } }), { status: failStatus });
  }
  const chunk = { id: "synthetic", object: "chat.completion.chunk", created: 0,
    model: "synthetic-model", choices: [{ index: 0, delta: { content: "Synthetic answer" }, finish_reason: "stop" }],
    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } };
  if (replyWithTool) {
    replyWithTool = false;
    chunk.choices[0] = { index: 0, delta: { tool_calls: [{ index: 0, id: "synthetic-tool", type: "function",
      function: { name: "get_project", arguments: JSON.stringify({ slug: "reva-ai" }) } }] }, finish_reason: "tool_calls" };
  }
  return new Response("data: " + JSON.stringify(chunk) + "\n\ndata: [DONE]\n\n",
    { headers: { "content-type": "text/event-stream" } });
};
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const localRequire = (name) => {
    if (name.startsWith("@/")) return load(path.join(root, "src", name.slice(2)) + ".ts");
    return require(name);
  };
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, require: localRequire,
    process: { env: runtimeEnv },
    crypto: webcrypto, fetch: fakeFetch, console, URL, Request, Response, Headers,
    TextEncoder, TextDecoder, ReadableStream, AbortController, AbortSignal,
    setTimeout, clearTimeout, Buffer,
  }, { filename: file });
  return module.exports;
}

const cases = [
  ["chat/stream", { messages: [{ role: "user", content: "Synthetic request" }], maxTokens: 1000000 }],
  ["mcp-review", { prDiff: "Synthetic diff", jiraAc: "Synthetic criteria", maxTokens: 1000000 }],
  ["playground", { messages: [{ role: "user", content: "Synthetic request" }], maxTokens: 1000000 }],
];
let failures = 0;
const limiter = load(path.join(root, "src/lib/rate-limit.ts"));
const allowances = [];
for (const ip of ["192.0.2.1", "192.0.2.2", "192.0.2.3"]) {
  const identity = limiter.getClientIp(new Request("http://fixture.invalid", {
    headers: { "x-forwarded-for": ip, "x-real-ip": ip },
  }));
  allowances.push((await limiter.rateLimit("identity-check:" + identity, 2, 3600000)).allowed);
}
if (JSON.stringify(allowances) !== "[true,true,false]") {
  failures++;
  console.error("FAIL untrusted forwarded headers reset the rate-limit bucket");
} else console.log("PASS untrusted forwarded headers share one rate-limit bucket");
runtimeEnv.VERCEL = "1";
assert.equal(limiter.getClientIp(new Request("http://fixture.invalid", { headers: { "x-forwarded-for": "192.0.2.10, 192.0.2.30" } })), "192.0.2.10");
assert.equal(limiter.getClientIp(new Request("http://fixture.invalid", { headers: { "x-real-ip": "192.0.2.20" } })), "192.0.2.20");
const ipOf = (ip) => limiter.getClientIp(new Request("http://fixture.invalid", { headers: { "x-forwarded-for": ip } }));
assert.equal(ipOf("2001:db8:1:2:aaaa::1"), "2001:db8:1:2::/64");
assert.equal(ipOf("2001:0db8:0001:0002:bbbb:cccc:dddd:eeee"), "2001:db8:1:2::/64");
assert.notEqual(ipOf("2001:db8:1:3::1"), ipOf("2001:db8:1:2::1"));
assert.equal(ipOf("::ffff:192.0.2.5"), "192.0.2.5");
console.log("PASS IPv6 clients share one bucket per /64");
delete runtimeEnv.VERCEL;
console.log("PASS configured Vercel header parsing remains compatible");
Object.assign(runtimeEnv, { UPSTASH_REDIS_REST_URL: "https://redis.fixture.invalid", UPSTASH_REDIS_REST_TOKEN: "synthetic" });
const shared = [];
for (let i = 0; i < 3; i++) shared.push((await limiter.rateLimit("shared-check", 2, 3600000)).allowed);
assert.deepEqual(shared, [true, true, false]);
assert.equal(redisCalls, 3, "configured shared store holds the counters");
assert.equal(redis.get("rl:shared-check"), 3);
delete runtimeEnv.UPSTASH_REDIS_REST_URL;
delete runtimeEnv.UPSTASH_REDIS_REST_TOKEN;
console.log("PASS counters live in the shared store when configured");
for (const [route, body] of cases) {
 for (const scenario of route === "chat/stream" ? ["normal", "fallback", "quota", "tool"] : ["normal", "fallback", "quota"]) {
  failOnce = scenario === "fallback" || scenario === "quota";
  failStatus = scenario === "quota" ? 429 : 503;
  replyWithTool = scenario === "tool";
  const before = requests.length;
  const { POST } = load(path.join(root, "src/app/api", route, "route.ts"));
  const response = await POST(new Request("http://fixture.invalid/api/" + route, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  }));
  assert.equal(response.status, 200, route + " remains usable");
  await response.text();
  const sent = requests.slice(before);
  assert.ok(sent.length, route + " reached the mocked provider");
  if (scenario !== "normal") assert.ok(sent.length >= 2, scenario + " triggered a second provider request");
  if (scenario === "fallback") {
    if (sent.at(-1).model === sent[0].model) {
      failures++;
      console.error("FAIL " + route + "/fallback: retry kept model " + String(sent[0].model));
    } else console.log("PASS " + route + "/fallback: retry switched model to " + String(sent.at(-1).model));
  }
  if (scenario === "quota") {
    if (sent.some(r => r.model !== sent[0].model)) {
      failures++;
      console.error("FAIL " + route + "/quota: a 429 spent the fallback model's quota");
    } else console.log("PASS " + route + "/quota: a 429 stays on " + String(sent[0].model));
  }
  for (const request of sent) {
    const limit = request.max_completion_tokens ?? request.max_tokens;
    if (limit !== 1024) {
      failures++;
      console.error("FAIL " + route + "/" + scenario + ": serialized output-token limit is " + String(limit));
    } else console.log("PASS " + route + "/" + scenario + ": serialized output-token limit is 1024");
  }
 }
}
{
  // History trim: a long conversation sends only the last few turns, each clamped.
  const { POST } = load(path.join(root, "src/app/api/chat/stream/route.ts"));
  const before = requests.length;
  const messages = Array.from({ length: 29 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x".repeat(50000) }));
  const response = await POST(new Request("http://fixture.invalid/api/chat/stream", {
    method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.1" }, body: JSON.stringify({ messages }),
  }));
  await response.text();
  const sent = requests.slice(before);
  const chars = sent.length ? JSON.stringify(sent[0].messages.filter(m => m.role !== "system")).length : Infinity;
  if (response.status !== 429 && chars > 20000) {
    failures++;
    console.error("FAIL chat/stream history: " + chars + " chars of history reached Groq");
  } else console.log("PASS chat/stream history trimmed to " + chars + " chars");
}
{
  // Global daily budget: fresh addresses (each under its own hourly limit) must still hit 429 before Groq.
  runtimeEnv.VERCEL = "1";
  const { POST } = load(path.join(root, "src/app/api/chat/stream/route.ts"));
  let served = 0, blocked = null;
  for (let i = 0; i < 1000 && !blocked; i++) {
    const before = requests.length;
    const response = await POST(new Request("http://fixture.invalid/api/chat/stream", {
      method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "198.51." + (i >> 8) + "." + (i & 255) },
      body: JSON.stringify({ messages: [{ role: "user", content: "Synthetic request" }] }),
    }));
    await response.text();
    if (response.status === 429) blocked = requests.length - before;
    else served++;
  }
  delete runtimeEnv.VERCEL;
  if (blocked !== 0 || served < 31) {
    failures++;
    console.error("FAIL chat/stream global budget: served " + served + ", blocked request reached Groq " + String(blocked) + " times");
  } else console.log("PASS chat/stream global budget returns 429 after " + served + " requests from distinct IPs without calling Groq");
}
assert.equal(failures, 0, "Every public AI route must bound output even when the client asks for more");
