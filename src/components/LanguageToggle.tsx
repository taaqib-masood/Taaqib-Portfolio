"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_COOKIE } from "@/lib/i18n";

/** Switches between English and the hand-written Arabic version (server-rendered, right-to-left). */
export function LanguageToggle() {
  const locale = useLocale();

  // Clear the cookie left by the old Google Translate widget, which fought React for the DOM.
  useEffect(() => {
    if (document.cookie.includes("googtrans=")) {
      document.cookie = "googtrans=; path=/; max-age=0";
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; max-age=0`;
    }
  }, []);

  const toggle = () => {
    const next = locale === "ar" ? "en" : "ar";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    window.location.reload();
  };

  return (
    <button
      id="language-toggle"
      onClick={toggle}
      lang={locale === "ar" ? "en" : "ar"}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className="fixed top-4 end-4 sm:top-6 sm:end-6 z-50 bg-[#000000] text-[#ffffff] border border-[#ffffff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#ffffff] hover:text-[#000000] transition-colors"
    >
      {locale === "ar" ? "[ EN ]" : "[ عربي ]"}
    </button>
  );
}
