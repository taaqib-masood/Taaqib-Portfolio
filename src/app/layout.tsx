import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandMenu } from "@/components/CommandMenu";
import { ScrollToTop } from "@/components/ScrollToTop";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Taaqib Masood | AI Engineer",
  description: "AI engineer building systems where the model isn't the demo, it's the infrastructure. LLM Agents, RAG, MCP, Full-Stack.",
  openGraph: {
    title: "Taaqib Masood | AI Engineer",
    description: "AI engineer building systems where the model isn't the demo, it's the infrastructure.",
    url: "https://taaqib-masood.github.io",
    siteName: "Taaqib Masood",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taaqib Masood | AI Engineer",
    description: "AI engineer building systems where the model isn't the demo, it's the infrastructure.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning dir="ltr">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          outfit.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CommandMenu />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
