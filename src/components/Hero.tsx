"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function Hero() {
  const handleAgentClick = () => {
    const agentEl = document.getElementById("agent");
    agentEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="hero" className="relative min-h-screen pt-24 px-6 md:px-16 flex flex-col justify-between max-w-[1440px] mx-auto border-b border-border">
      
      {/* Massive Typography & Photo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 mt-12 lg:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-8 flex flex-col justify-center"
        >
          <h1 className="text-[48px] md:text-[80px] lg:text-[120px] font-bold leading-[1] tracking-[-0.04em] text-foreground uppercase">
            TAAQIB
            <br />
            MASOOD
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4 flex justify-start lg:justify-end items-end"
        >
          <div className="relative w-[200px] h-[200px] md:w-[300px] md:h-[300px] border border-border bg-surface-container overflow-hidden">
            {/* User must place their photo at public/taaqib-photo.jpg */}
            <Image
              src="/taaqib-photo.jpg"
              alt="Taaqib Masood"
              fill
              className="object-cover grayscale"
              onError={(e) => {
                // Fallback if image is missing
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-widest text-outline -z-10">
              Replace with /taaqib-photo.jpg
            </div>
          </div>
        </motion.div>
      </div>

      {/* Structural Data Blocks */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-border">
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
        >
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-4">Position</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            AI Engineer
            <br />
            Ex-Intern @ L&T
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 lg:border-r border-border"
        >
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-4">Definition</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            Building systems where the model isn&apos;t the demo, it&apos;s the infrastructure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
        >
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-4">Focus</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            Agentic tool-calling, RAG, MCP, and CV pipelines. Python & TypeScript.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 md:p-8 flex flex-col justify-between"
        >
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-4">Status</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em] mb-8">
            Based in Dubai.
            <br />
            Available for Engineering roles.
          </p>
          <button
            onClick={handleAgentClick}
            className="group flex items-center justify-between border border-border bg-surface px-4 py-3 text-[12px] font-semibold uppercase tracking-widest transition-colors hover:bg-primary hover:text-on-primary active:bg-foreground active:text-on-primary w-full"
          >
            Ask Agent <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </motion.div>

      </div>

    </section>
  );
}
