"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useT } from "@/components/LocaleProvider";

/** Streams text in character by character behind a cobalt caret, like model output. */
export function TokenText({ text: source, delay = 0, speed = 38 }: { text: string; delay?: number; speed?: number }) {
  const text = useT()(source);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const [caret, setCaret] = useState(true);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setShown(text.length); setCaret(false); return; }
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setShown(++i);
        if (i >= text.length) {
          clearInterval(interval);
          hide = setTimeout(() => setCaret(false), 900);
        }
      }, speed);
    }, delay);
    return () => { clearTimeout(start); clearInterval(interval); clearTimeout(hide); };
  }, [inView, reduced, text, delay, speed]);

  return (
    <span ref={ref} className="relative">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {caret && inView && !reduced && (
          <span className="inline-block w-[0.45em] h-[0.8em] bg-primary align-baseline ml-[0.04em] -mb-[0.02em] animate-pulse" />
        )}
        {/* Unstreamed characters hold their space so the layout never shifts. */}
        <span className="invisible">{text.slice(shown)}</span>
      </span>
    </span>
  );
}
