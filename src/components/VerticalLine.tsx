"use client";

import { motion } from "framer-motion";

export function VerticalLine({ className = "bg-border" }: { className?: string }) {
  return (
    <motion.div
      className={`hidden md:block absolute top-0 -right-[1px] w-[1px] h-full origin-top z-30 ${className}`}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.83, 0, 0.17, 1] }}
    />
  );
}
