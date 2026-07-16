"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <div 
      ref={containerRef}
      className="w-full border-t border-b border-border overflow-hidden bg-surface py-4 relative flex items-center"
    >
      <motion.div 
        style={{ x }}
        className="flex whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.2em] text-foreground"
      >
        <span className="px-4">AI ENGINEER · LLM AGENTS · RAG · MCP · DUBAI ·</span>
        <span className="px-4">AI ENGINEER · LLM AGENTS · RAG · MCP · DUBAI ·</span>
        <span className="px-4">AI ENGINEER · LLM AGENTS · RAG · MCP · DUBAI ·</span>
        <span className="px-4">AI ENGINEER · LLM AGENTS · RAG · MCP · DUBAI ·</span>
      </motion.div>
    </div>
  );
}
