"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Command as CommandIcon } from "lucide-react";
import { useT } from "@/components/LocaleProvider";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

export function CommandMenu() {
  const t = useT();
  const [open, setOpen] = useState(false);
  // Mounted from the first open onwards, so its exit animation still plays on close.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (open) setLoaded(true); }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[92px] right-4 sm:bottom-16 sm:right-6 z-40 flex items-center justify-center gap-2 border border-border bg-surface px-3 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-primary hover:text-on-primary hover:border-primary md:hidden shadow-lg"
        aria-label="Open command menu"
      >
        <CommandIcon className="h-4 w-4" />
        <span>{t("Menu")}</span>
      </button>
      {loaded && <CommandPalette open={open} setOpen={setOpen} />}
    </>
  );
}
