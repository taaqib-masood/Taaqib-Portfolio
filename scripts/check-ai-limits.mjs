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
let replyWithTool = false;
const fakeFetch = async (url, options) => {
  assert.equal(new URL(String(url)).hostname, "api.groq.com");
  requests.push(JSON.parse(options.body));
  if (failOnce) {
    failOnce = false;
    return new Response(JSON.stringify({ error: { message: "Synthetic retry" } }), { status: 503 });
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
const allowances = ["192.0.2.1", "192.0.2.2", "192.0.2.3"].map(ip => {
  const identity = limiter.getClientIp(new Request("http://fixture.invalid", {
    headers: { "x-forwarded-for": ip, "x-real-ip": ip },
  }));
  return limiter.rateLimit("identity-check:" + identity, 2, 3600000).allowed;
});
if (JSON.stringify(allowances) !== "[true,true,false]") {
  failures++;
  console.error("FAIL untrusted forwarded headers reset the rate-limit bucket");
} else console.log("PASS untrusted forwarded headers share one rate-limit bucket");
runtimeEnv.VERCEL = "1";
assert.equal(limiter.getClientIp(new Request("http://fixture.invalid", { headers: { "x-forwarded-for": "192.0.2.10, 192.0.2.30" } })), "192.0.2.10");
assert.equal(limiter.getClientIp(new Request("http://fixture.invalid", { headers: { "x-real-ip": "192.0.2.20" } })), "192.0.2.20");
delete runtimeEnv.VERCEL;
console.log("PASS configured Vercel header parsing remains compatible");
for (const [route, body] of cases) {
 for (const scenario of route === "chat/stream" ? ["normal", "fallback", "tool"] : ["normal", "fallback"]) {
  failOnce = scenario === "fallback";
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
  for (const request of sent) {
    const limit = request.max_completion_tokens ?? request.max_tokens;
    if (limit !== 1024) {
      failures++;
      console.error("FAIL " + route + "/" + scenario + ": serialized output-token limit is " + String(limit));
    } else console.log("PASS " + route + "/" + scenario + ": serialized output-token limit is 1024");
  }
 }
}
assert.equal(failures, 0, "Every public AI route must bound output even when the client asks for more");
