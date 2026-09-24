"use client";

import { useState, useEffect } from "react";

// Google Translate is only downloaded for visitors who switched to Arabic: English
// visitors (most traffic) never load the third-party script at all.
function loadGoogleTranslate() {
  if (document.getElementById("google-translate-script")) return;
  const w = window as unknown as { googleTranslateElementInit: () => void; google: { translate: { TranslateElement: new (o: object, id: string) => unknown } } };
  w.googleTranslateElementInit = () => {
    new w.google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "ar,en", autoDisplay: false }, "google_translate_element");
  };
  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function LanguageToggle() {
  const [lang, setLang] = useState<"EN" | "AR">("EN");

  useEffect(() => {
    // Check if Arabic translation is active via cookie
    if (document.cookie.includes("googtrans=/en/ar")) {
      setLang("AR");
      document.documentElement.dir = "rtl";
      loadGoogleTranslate();
    } else {
      setLang("EN");
      document.documentElement.dir = "ltr";
    }
  }, []);

  const toggleLang = () => {
    const nextLang = lang === "EN" ? "AR" : "EN";
    
    if (nextLang === "AR") {
      document.cookie = `googtrans=/en/ar; path=/; domain=${window.location.hostname}; Secure; SameSite=Lax`;
      document.cookie = `googtrans=/en/ar; path=/; Secure; SameSite=Lax`;
    } else {
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname}; Secure; SameSite=Lax`;
      document.cookie = `googtrans=/en/en; path=/; Secure; SameSite=Lax`;
    }
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <button
        id="language-toggle"
        onClick={toggleLang}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-[#000000] text-[#ffffff] border border-[#ffffff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#ffffff] hover:text-[#000000] transition-colors shadow-none rounded-none"
      >
        [ {lang} / {lang === "EN" ? "AR" : "EN"} ]
      </button>
    </>
  );
}
