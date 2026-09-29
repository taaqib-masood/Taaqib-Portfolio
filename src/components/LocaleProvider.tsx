"use client";

import { createContext, useCallback, useContext } from "react";
import { translate, type Dictionary, type Locale } from "@/lib/i18n";

const Ctx = createContext<{ locale: Locale; dict: Dictionary | null }>({ locale: "en", dict: null });

/** The server picks the locale from the cookie and only sends the Arabic dictionary to Arabic visitors. */
export function LocaleProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary | null; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, dict }}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx).locale;

export function useT() {
  const { dict } = useContext(Ctx);
  return useCallback((s: string) => translate(dict, s), [dict]);
}
