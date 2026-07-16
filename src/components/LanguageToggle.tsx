"use client";

import { useState, useEffect } from "react";

export function LanguageToggle() {
  const [lang, setLang] = useState<"EN" | "AR">("EN");

  useEffect(() => {
    // Check if Arabic translation is active via cookie
    if (document.cookie.includes("googtrans=/en/ar")) {
      setLang("AR");
      document.documentElement.dir = "rtl";
    } else {
      setLang("EN");
      document.documentElement.dir = "ltr";
    }
  }, []);

  const toggleLang = () => {
    const nextLang = lang === "EN" ? "AR" : "EN";
    
    if (nextLang === "AR") {
      document.cookie = `googtrans=/en/ar; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/ar; path=/`;
    } else {
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/en; path=/`;
    }
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <button
        id="language-toggle"
        onClick={toggleLang}
        className="fixed top-6 right-6 z-50 bg-[#ffffff] text-[#1a1c1c] border border-[#1a1c1c] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1c1c] hover:text-[#ffffff] transition-colors shadow-none rounded-none"
      >
        [ {lang} / {lang === "EN" ? "AR" : "EN"} ]
      </button>
    </>
  );
}
