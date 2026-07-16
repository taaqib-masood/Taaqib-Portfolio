"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { aboutParagraphs } from "@/data/resume";
import { projects } from "@/data/projects";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { VerticalLine } from "@/components/VerticalLine";

export function About() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["50%", "0%"]); // Use 50% to prevent massive white gaps, still gives the fast slide-up effect

  const numProjects = projects.length;
  // 6 spoken languages (English, Hindi, Urdu, Tamil, Malayalam, Arabic)
  const numLanguages = 6;
  const contributions = 569;

  return (
    <section ref={containerRef} id="about" className="max-w-[1440px] mx-auto border-b border-border overflow-hidden">
      <motion.div style={{ y }} className="w-full bg-background relative z-20">
      {/* Header */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 border-b border-border overflow-hidden">
        <ParallaxNumber number="04" />
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 relative flex flex-col justify-center">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] relative z-10">About</h2>
          <VerticalLine />
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface-container-low flex flex-col justify-center">
          <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-outline">
            AI Engineer · Dubai, UAE
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
          }}
          className="lg:col-span-8 p-6 md:p-8 border-b lg:border-b-0 relative bg-surface"
        >
          <VerticalLine />
          <div className="flex flex-col gap-6">
            {aboutParagraphs.map((paragraph, index) => (
              <motion.p 
                key={index} 
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.83, 0, 0.17, 1] } }
                }}
                className="text-[16px] md:text-[18px] leading-[1.6] tracking-[-0.01em] text-foreground max-w-[65ch]"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-4 flex flex-col bg-surface"
        >
          <div className="grid grid-cols-2 lg:grid-cols-1 h-full">
            <div className="p-6 md:p-8 border-r lg:border-r-0 lg:border-b border-border flex flex-col justify-center">
              <span className="text-[32px] md:text-[48px] font-bold leading-[1] tracking-[-0.03em] uppercase mb-2">5+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Months @ L&T</span>
            </div>
            <div className="p-6 md:p-8 border-b lg:border-b border-border flex flex-col justify-center">
              <span className="text-[32px] md:text-[48px] font-bold leading-[1] tracking-[-0.03em] uppercase mb-2">{numProjects}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Shipped Projects</span>
            </div>
            <div className="p-6 md:p-8 border-r lg:border-r-0 lg:border-b border-border flex flex-col justify-center">
              <span className="text-[32px] md:text-[48px] font-bold leading-[1] tracking-[-0.03em] uppercase mb-2">{contributions}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">GitHub Commits/Yr</span>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className="text-[32px] md:text-[48px] font-bold leading-[1] tracking-[-0.03em] uppercase mb-2">{numLanguages}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Languages Spoken</span>
            </div>
          </div>
        </motion.div>
      </div>
      </motion.div>
    </section>
  );
}
