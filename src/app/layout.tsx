import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

import { CommandMenu } from "@/components/CommandMenu";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollFloor3D } from "@/components/ScrollFloor3D";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://taaqib-portfolio.vercel.app";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning dir="ltr">
      <head>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'ar,en', autoDisplay: false}, 'google_translate_element');
            }
          `
        }}></script>
        <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async></script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground overflow-x-hidden pb-[88px] sm:pb-[56px]",
          inter.variable,
          outfit.variable
        )}
      >
        {children}
        <CommandMenu />
        <ScrollToTop />
        <ScrollFloor3D />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
