// Self-check for security headers (no server needed):
// 1. Executes src/middleware.ts against real next/server — asserts CSP + per-request nonce.
// 2. Asserts static headers (HSTS, XFO, nosniff) registered in .next/routes-manifest.json.
// Run: node --experimental-strip-types scripts/check-headers.mjs  (or via bun)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NextRequest, NextResponse } from "next/server";

const { middleware } = await import("../src/middleware.ts");

// Spy on NextResponse.next to capture the derived request headers the
// middleware hands to Next (where the x-nonce forwarding matters).
let capturedRequestHeaders = null;
const realNext = NextResponse.next.bind(NextResponse);
NextResponse.next = (...args) => {
  const request = args[0]?.request;
  if (request?.headers) capturedRequestHeaders = request.headers;
  return realNext(...args);
};

function runMiddleware(url) {
  const request = new NextRequest(url);
  const response = middleware(request);
  return { response, derivedHeaders: capturedRequestHeaders };
}

// --- 1. Middleware CSP ---
const a = runMiddleware("http://localhost:3000/");
const cspA = a.response.headers.get("Content-Security-Policy");
assert.ok(cspA, "middleware sets CSP on response");
const nonceA = cspA.match(/nonce-([A-Za-z0-9+/=]+)/)?.[1];
assert.ok(nonceA, "CSP contains a nonce");
assert.ok(cspA.includes("'strict-dynamic'"), "CSP uses strict-dynamic");
assert.ok(cspA.includes("frame-ancestors 'none'"), "CSP denies framing");
assert.ok(a.derivedHeaders.get("x-nonce") === nonceA, "nonce forwarded to Next via x-nonce");
assert.equal(a.response.headers.get("Content-Security-Policy"), a.derivedHeaders.get("Content-Security-Policy"), "request+response CSP match");

// Second request gets a DIFFERENT nonce (per-request freshness)
const b = runMiddleware("http://localhost:3000/playground");
const cspB = b.response.headers.get("Content-Security-Policy");
const nonceB = cspB.match(/nonce-([A-Za-z0-9+/=]+)/)?.[1];
assert.ok(nonceA !== nonceB, "nonce differs per request");

// Allowlist sanity
assert.ok(cspA.includes("connect-src 'self' https://va.vercel-scripts.com"), "connect-src allowlist");
assert.ok(!cspA.includes("api.github.com"), "browser never talks to GitHub directly (served via /api/github)");

// --- 1b. Cross-site API writes are refused before reaching any route ---
const api = (headers, method = "POST") => middleware(new NextRequest("http://localhost:3000/api/contact", { method, headers: { host: "localhost:3000", ...headers } }));
assert.equal(api({ "content-type": "text/plain", origin: "https://evil.example", "sec-fetch-site": "cross-site" }).status, 403, "cross-site text/plain POST blocked");
assert.equal(api({ "content-type": "application/json", origin: "https://evil.example" }).status, 403, "foreign Origin blocked even with JSON");
assert.equal(api({ "content-type": "text/plain", "sec-fetch-site": "same-origin" }).status, 415, "non-JSON body rejected");
assert.equal(api({ "content-type": "application/json", origin: "http://localhost:3000", "sec-fetch-site": "same-origin" }).status, 200, "same-origin JSON passes");
assert.equal(api({}, "GET").status, 200, "GET is never blocked");
assert.ok(!cspA.includes("script-src 'self' 'unsafe-inline'"), "no unsafe-inline in prod script-src");
assert.ok(!cspA.includes("'unsafe-eval'"), "no unsafe-eval in prod");

// --- 2. Static headers in the production manifest ---
const manifest = JSON.parse(readFileSync(new URL("../.next/routes-manifest.json", import.meta.url), "utf8"));
const headerEntries = manifest.headers.flatMap((h) => h.headers);
const get = (key) => headerEntries.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
assert.match(get("Strict-Transport-Security"), /max-age=63072000; includeSubDomains; preload/, "HSTS registered");
assert.equal(get("X-Frame-Options"), "DENY", "X-Frame-Options: DENY registered");
assert.equal(get("X-Content-Type-Options"), "nosniff", "nosniff registered");
assert.ok(get("Referrer-Policy") && get("Permissions-Policy"), "Referrer-Policy + Permissions-Policy registered");
assert.equal(get("Cross-Origin-Opener-Policy"), "same-origin", "COOP registered");

console.log("PASS: middleware CSP (per-request nonce, strict-dynamic, frame-ancestors none), cross-site API guard, static security headers in routes manifest");
