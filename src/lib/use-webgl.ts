"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Gate shared by every WebGL scene.
 * - `supported`: WebGL exists and the viewport matches `media` (mount the canvas at all).
 * - `animate`: on screen and the user allows motion (otherwise render one still frame).
 */
export function useWebGLGate(ref: RefObject<Element | null>, media = "(min-width: 0px)") {
  const [supported, setSupported] = useState(false);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: "200px" });

  useEffect(() => {
    const mq = window.matchMedia(media);
    const check = () => {
      let gl = false;
      try { gl = !!document.createElement("canvas").getContext("webgl2"); } catch { /* no WebGL */ }
      setSupported(gl && mq.matches);
    };
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, [media]);

  return { supported, reduced: !!reduced, animate: supported && inView && !reduced };
}
