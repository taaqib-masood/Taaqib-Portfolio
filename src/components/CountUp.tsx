"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Rolls a number up from 0 once it scrolls into view. Renders the final value on the server and for reduced motion. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.83, 0, 0.17, 1],
      onUpdate: (n) => { el.textContent = `${Math.round(n)}${suffix}`; },
    });
    return () => controls.stop();
  }, [inView, reduced, value, suffix]);

  return <span ref={ref}>{value}{suffix}</span>;
}
