import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

import { CommandMenu } from "@/components/CommandMenu";
import { ScrollToTop } from "@/components/ScrollToTop";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://taaqib-masood.github.io"),
  title: "Taaqib Masood | AI Engineer",
  description: "AI engineer building systems where the model isn't the demo, it's the infrastructure. LLM Agents, RAG, MCP, Full-Stack.",
  openGraph: {
    title: "Taaqib Masood | AI Engineer",
    description: "AI engineer building systems where the model isn't the demo, it's the infrastructure.",
    url: "https://taaqib-masood.github.io",
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
          "min-h-screen bg-background font-sans antialiased text-foreground overflow-x-hidden",
          inter.variable,
          outfit.variable
        )}
      >
        {children}
        <CommandMenu />
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
