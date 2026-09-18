import { NextResponse, type NextRequest } from "next/server";

// Strict nonce-based CSP, generated per request (Next.js docs pattern).
// The nonce in the request headers makes Next.js apply it to its own inline
// scripts; 'strict-dynamic' propagates trust to runtime-injected scripts
// (Vercel Analytics, Google Translate widget) without open host allowlists.
// NOTE: serving with a per-request nonce disables static caching for pages.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://translate.google.com${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ""}`,
    `style-src 'self' 'unsafe-inline'`, // framer-motion + Next inline styles; unavoidable without build-time hashes
    `img-src 'self' data: blob: https://va.vercel-scripts.com`,
    `font-src 'self'`,
    `connect-src 'self' https://api.github.com https://va.vercel-scripts.com https://translate.googleapis.com https://translate.google.com`,
    `frame-ancestors 'none'`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Documents only — static assets never need a CSP nonce.
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|taaqib-photo|taaqib-masood-cv|og-image).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
