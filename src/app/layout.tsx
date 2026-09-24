import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import { CommandMenu } from "@/components/CommandMenu";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollFloor3D } from "@/components/ScrollFloor3D";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/lib/site-url";
import { LOCALE_COOKIE, localeFromCookie } from "@/lib/i18n";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ar } from "@/data/ar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Arabic face for the Arabic version (Inter has no Arabic glyphs). Only used when lang="ar".
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});


// Required by the nonce-based CSP in src/middleware.ts: inline hydration
// scripts must be rendered per-request so Next can stamp them with the
// nonce from the CSP request header. Without this, prerendered/cached HTML
// has no nonces and every inline script is blocked (site never hydrates).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Taaqib Masood | AI Engineer",
  description: "AI engineer building systems where the model isn't the demo, it's the infrastructure. LLM Agents, RAG, MCP, Full-Stack.",
  openGraph: {
    title: "Taaqib Masood | AI Engineer",
    description: "AI engineer building systems where the model isn't the demo, it's the infrastructure.",
    url: siteUrl,
    siteName: "Taaqib Masood",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Taaqib Masood | AI Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taaqib Masood | AI Engineer",
    description: "AI engineer building systems where the model isn't the demo, it's the infrastructure.",
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Language is chosen server-side from a cookie, so Arabic arrives already translated and RTL.
  const locale = localeFromCookie((await cookies()).get(LOCALE_COOKIE)?.value);
  return (
    <html lang={locale} suppressHydrationWarning dir={locale === "ar" ? "rtl" : "ltr"}>
      <head></head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground overflow-x-hidden pb-[88px] sm:pb-[56px]",
          inter.variable,
          plexArabic.variable
        )}
      >
        <LocaleProvider locale={locale} dict={locale === "ar" ? ar : null}>
          {children}
          <CommandMenu />
          <ScrollToTop />
        </LocaleProvider>
        <ScrollFloor3D />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
