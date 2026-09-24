"use client";

import { setAudience, useAudience } from "@/lib/audience";

/** Switches every project description between engineer detail and plain business outcomes. */
export function AudienceToggle() {
  const audience = useAudience();
  return (
    <div
      role="group"
      aria-label="Reading mode"
      className="fixed top-4 right-[92px] sm:top-6 sm:right-[116px] z-50 flex border border-[#ffffff] bg-[#000000] text-[10px] font-bold uppercase tracking-widest"
    >
      {(["tech", "plain"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setAudience(mode)}
          aria-pressed={audience === mode}
          className={`px-3 py-1.5 transition-colors ${audience === mode ? "bg-[#ffffff] text-[#000000]" : "text-[#ffffff] hover:bg-[#ffffff]/15"}`}
        >
          {mode === "tech" ? "Technical" : "Plain English"}
        </button>
      ))}
    </div>
  );
}
