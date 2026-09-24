"use client";

import { useEffect, useRef, useState } from "react";

/** Full-viewport hairline crosshair with a coordinate readout. Mouse/trackpad only, off for reduced motion. */
export function Crosshair() {
  const [on, setOn] = useState(false);
  const h = useRef<HTMLDivElement>(null);
  const v = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOn(window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches);
  }, []);

  useEffect(() => {
    if (!on) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { clientX: x, clientY: y } = e;
        h.current!.style.transform = `translateY(${y}px)`;
        v.current!.style.transform = `translateX(${x}px)`;
        const target = (e.target as Element | null)?.closest?.("a, button, input, textarea, select, [role=button]");
        const kind = target ? `▸ ${target.tagName === "A" ? "LINK" : target.tagName}` : "";
        label.current!.textContent = `X ${String(Math.round(x)).padStart(4, "0")} Y ${String(Math.round(y)).padStart(4, "0")} ${kind}`;
        label.current!.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(frame); };
  }, [on]);

  if (!on) return null;
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-[60] mix-blend-difference">
      <div ref={h} className="absolute left-0 right-0 top-0 h-px bg-white/25" />
      <div ref={v} className="absolute top-0 bottom-0 left-0 w-px bg-white/25" />
      <div ref={label} className="absolute left-0 top-0 font-mono text-[10px] tracking-[0.12em] text-white whitespace-nowrap" />
    </div>
  );
}
