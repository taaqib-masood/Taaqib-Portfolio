"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxNumber({ number }: { number: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <motion.div
      ref={ref}
      style={{ y, WebkitTextStroke: "1px currentColor", WebkitTextFillColor: "transparent" }}
      aria-hidden="true"
      className="absolute top-0 left-4 md:left-8 z-0 pointer-events-none select-none text-[120px] md:text-[200px] leading-none font-black tracking-[-0.05em] opacity-25"
    >
      {number}
    </motion.div>
  );
}
