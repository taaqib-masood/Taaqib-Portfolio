// Canonical origin for metadata, sitemap and robots: the production domain on Vercel,
// the deployment URL on previews, and the public Vercel domain everywhere else.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://taaqib-portfolio.vercel.app";
