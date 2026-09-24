"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useWebGLGate } from "@/lib/use-webgl";
import { useAudience } from "@/lib/audience";
import { useT } from "@/components/LocaleProvider";

// three.js stays out of the initial bundle; it loads only once the hero mounts on a WebGL device.
const Globe3D = dynamic(() => import("@/components/hero/Globe3D"), { ssr: false });

export function Hero() {
  const t = useT();
  const containerRef = useRef<HTMLElement>(null);
  const { supported, animate } = useWebGLGate(containerRef, "(min-width: 768px)");
  const plain = useAudience() === "plain";
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });

  const handleAgentClick = () => {
    const agentEl = document.getElementById("agent");
    agentEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={containerRef} id="hero" className="relative min-h-screen pt-24 px-6 md:px-16 flex flex-col justify-between max-w-[1440px] mx-auto border-b border-border overflow-hidden">
      
      {/* Massive Typography & Photo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 mt-12 lg:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.83, 0, 0.17, 1] }}
          className="lg:col-span-7 flex flex-col justify-center relative z-10 pointer-events-none"
        >
          <h1 lang="en" className="text-[clamp(36px,10.5vw,180px)] font-black leading-[0.9] tracking-[-0.05em] text-foreground uppercase whitespace-nowrap">
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
      <div className="relative mt-24">
      {/* Globe rises from the data row's top rule (the horizon), left of the photo column. */}
      {supported && (
        <div className="absolute bottom-full start-0 w-full lg:w-[56%] h-[380px]">
          <Globe3D progress={scrollYProgress} animate={animate} />
        </div>
      )}
      <div className="relative z-10 bg-background grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-border">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">{t("POSITION")}</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            {t("AI Engineer")}
            <br />
            {t("Ex-Intern @ L&T")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 lg:border-r border-border"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">{t("DEFINITION")}</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            {plain
              ? t("I build software where AI does real work: booking patients, screening candidates, reviewing code.")
              : t("Building systems where the model isn\u2019t the demo, it\u2019s the infrastructure.")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">{t("FOCUS")}</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em]">
            {plain
              ? t("Products that save teams hours: automated hiring, clinic booking, trading risk control.")
              : t("Agentic tool-calling, RAG, MCP, and CV pipelines. Python & TypeScript.")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.83, 0, 0.17, 1] }}
          className="p-6 md:p-8 flex flex-col justify-between"
        >
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.05em] mb-4">{t("STATUS")}</h3>
          <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.01em] mb-8">
            {t("Based in Dubai.")}
            <br />
            {t("Available for Engineering roles.")}
          </p>
          <div className="flex flex-col gap-3 w-full">
            {/* The headline CTA: recruiters can interview the AI proxy right now, no scheduling. */}
            <button
              onClick={handleAgentClick}
              className="group flex items-center justify-between gap-4 border-2 border-[#ffffff] bg-[#ffffff] px-6 py-4 text-start text-[#000000] transition-all hover:bg-primary hover:border-primary hover:text-[#ffffff] w-full"
            >
              <span>
                <span className="block text-[14px] font-bold uppercase tracking-widest">{t("Interview my AI instead")}</span>
                <span className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                  {t("Live agent · answers as me, 24/7")}
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 rtl:-scale-x-100" />
            </button>
          </div>
        </motion.div>

      </div>
      </div>

    </section>
  );
}
