"use client";

import { useSyncExternalStore } from "react";

export type Audience = "tech" | "plain";
const KEY = "audience";
const EVENT = "audience-change";

// Precedence: ?view=plain|tech in the URL (so a recruiter link can open in plain mode),
// then the viewer's last choice, then technical.
function read(): Audience {
  const param = new URLSearchParams(window.location.search).get("view");
  if (param === "plain" || param === "tech") return param;
  try { return localStorage.getItem(KEY) === "plain" ? "plain" : "tech"; } catch { return "tech"; }
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

/** Server and first client render are always "tech", so hydration matches. */
export function useAudience(): Audience {
  return useSyncExternalStore(subscribe, read, () => "tech");
}
