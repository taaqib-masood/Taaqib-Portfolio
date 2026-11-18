"use client";

import { useSyncExternalStore } from "react";

export type Audience = "tech" | "plain";
const DEFAULT_AUDIENCE: Audience = "plain";
const KEY = "audience";
const EVENT = "audience-change";

// Precedence: explicit ?view=plain|tech, saved choice, then Plain English.
function read(): Audience {
  const param = new URLSearchParams(window.location.search).get("view");
  if (param === "plain" || param === "tech") return param;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "plain" || saved === "tech") return saved;
  } catch { /* Storage can be unavailable. */ }
  return DEFAULT_AUDIENCE;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener("storage", onChange); };
}

export function setAudience(next: Audience) {
  try { localStorage.setItem(KEY, next); } catch { /* private mode: choice lasts for this page only */ }
  const url = new URL(window.location.href);
  url.searchParams.set("view", next);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(EVENT));
}

export function useAudience(): Audience {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_AUDIENCE);
}
