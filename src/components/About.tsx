"use client";

import { motion } from "framer-motion";
import { aboutParagraphs } from "@/data/resume";
import { projects } from "@/data/projects";

export function About() {
  const numProjects = projects.length;
  // 6 spoken languages (English, Hindi, Urdu, Tamil, Malayalam, Arabic)
  const numLanguages = 6;
  const contributions = 569;

  return (
    <section id="about" className="max-w-[1440px] mx-auto border-b border-border">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]">About</h2>
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface-container-low flex flex-col justify-center">
          <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-outline">
            AI Engineer · Dubai, UAE
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-8 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border bg-surface"
        >
          <div className="flex flex-col gap-6">
            {aboutParagraphs.map((paragraph, index) => (
              <p key={index} className="text-[16px] md:text-[18px] leading-[1.6] tracking-[-0.01em] text-foreground max-w-[65ch]">
                {paragraph}
              </p>
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
    </section>
  );
}
