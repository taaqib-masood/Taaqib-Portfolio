"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { WireframeMonolith } from "@/components/WireframeMonolith";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  const handleAgentClick = () => {
    const agentEl = document.getElementById("agent");
    agentEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={containerRef} id="hero" className="relative min-h-screen pt-24 px-6 md:px-16 flex flex-col justify-between max-w-[1440px] mx-auto border-b border-border overflow-hidden">
      <WireframeMonolith />
      
      {/* Massive Typography & Photo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 mt-12 lg:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.83, 0, 0.17, 1] }}
          className="lg:col-span-7 flex flex-col justify-center relative z-10"
        >
          <h1 className="text-[clamp(36px,10.5vw,180px)] font-black leading-[0.9] tracking-[-0.05em] text-foreground uppercase whitespace-nowrap">
            TAAQIB
            <br />
            MASOOD
          </h1>
        </motion.div>

        <div className="lg:col-span-5 flex justify-start lg:justify-end items-end w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
            className="relative w-full aspect-[4/5] border border-border bg-surface-container overflow-hidden"
          >
            <div style={{ width: "100%", height: "100%" }} className="relative">
              <Image
                src="/taaqib-photo.jpg"
                alt="Taaqib Masood"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover object-top"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Structural Data Blocks */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-border">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">POSITION</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            AI Engineer
            <br />
            Ex-Intern @ L&T
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 lg:border-r border-border"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">DEFINITION</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            Building systems where the model isn&apos;t the demo, it&apos;s the infrastructure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">FOCUS</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            Agentic tool-calling, RAG, MCP, and CV pipelines. Python & TypeScript.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 flex flex-col justify-between"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">STATUS</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em] mb-8">
            Based in Dubai.
            <br />
            Available for Engineering roles.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleAgentClick}
              className="group flex items-center justify-between border-2 border-[#ffffff] bg-transparent px-6 py-4 text-[14px] font-bold uppercase tracking-widest text-[#ffffff] transition-all hover:bg-[#ffffff] hover:text-[#000000] w-full"
            >
              Ask Agent <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
            <a
              href="/taaqib-masood-cv.pdf"
              download
              className="group flex items-center justify-between border-2 border-[#ffffff] bg-transparent px-6 py-4 text-[14px] font-bold uppercase tracking-widest text-[#ffffff] transition-all hover:bg-[#ffffff] hover:text-[#000000] w-full"
            >
              Download CV <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </motion.div>

      </div>

    </section>
  );
}
