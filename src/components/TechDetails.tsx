"use client";

import { useState } from "react";
import { useAudience } from "@/lib/audience";
import { useT } from "@/components/LocaleProvider";

/** Engineer-facing sections: open in Technical mode, one click away in Plain-English mode. */
export function TechDetails({ children }: { children: React.ReactNode }) {
  const t = useT();
  const plain = useAudience() === "plain";
  const [open, setOpen] = useState(false);
  if (!plain || open) return <>{children}</>;
  return (
    <div className="border-b border-border p-6 md:p-8">
      <button
        onClick={() => setOpen(true)}
        className="border border-border px-5 min-h-12 text-[12px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
      >
        {t("Show architecture & engineering decisions")}
      </button>
    </div>
  );
}
