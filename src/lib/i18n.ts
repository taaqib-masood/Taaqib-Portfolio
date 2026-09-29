export type Locale = "en" | "ar";
export const LOCALE_COOKIE = "lang";
export type Dictionary = Record<string, string>;

export const localeFromCookie = (value: string | undefined): Locale => (value === "ar" ? "ar" : "en");

/** English text is the key; anything without a translation falls back to English, never blank. */
export const translate = (dict: Dictionary | null, s: string) => (dict && dict[s]) || s;
