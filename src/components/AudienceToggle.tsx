"use client";

import { setAudience, useAudience } from "@/lib/audience";
import { useT } from "@/components/LocaleProvider";

/** Switches every project description between engineer detail and plain business outcomes. */
export function AudienceToggle() {
  const t = useT();
  const audience = useAudience();
  return (
    <div
      role="group"
      aria-label={t("Reading mode")}
      className="fixed top-4 end-[92px] sm:top-6 sm:end-[116px] z-50 flex border border-[#ffffff] bg-[#000000] text-[10px] font-bold uppercase tracking-widest"
    >
      {(["tech", "plain"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setAudience(mode)}
          aria-pressed={audience === mode}
          className={`px-3 py-1.5 transition-colors ${audience === mode ? "bg-[#ffffff] text-[#000000]" : "text-[#ffffff] hover:bg-[#ffffff]/15"}`}
        >
          {t(mode === "tech" ? "Technical" : "Plain English")}
        </button>
      ))}
    </div>
  );
}
