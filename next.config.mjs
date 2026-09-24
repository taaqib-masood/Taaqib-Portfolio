/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains; allow preload into HSTS lists.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Belt-and-suspenders framing denial (CSP frame-ancestors 'none' covers modern browsers).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Isolate the browsing context: a page opened from here (or that opens us) can't script this window.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Public files change rarely: browsers reuse them for a day and revalidate in the background for a week.
const assetCache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];

const nextConfig = {
  poweredByHeader: false, // don't advertise the framework/version to scanners
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      { source: "/:file(taaqib-photo.jpg|taaqib-masood-cv.pdf|og-image.jpg)", headers: assetCache },
    ];
  },
};

export default nextConfig;
