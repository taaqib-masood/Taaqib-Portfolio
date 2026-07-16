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
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 , ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/3 shrink-0"
        >
          <h2 className="font-heading text-3xl font-bold mb-2">About</h2>
          <p className="text-violet-400 font-medium">AI Engineer · Dubai, UAE</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 , ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-2/3 flex flex-col gap-6"
        >
          {aboutParagraphs.map((paragraph, index) => (
            <p key={index} className="text-slate-300 text-lg leading-relaxed max-w-[65ch]">
              {paragraph}
            </p>
          ))}

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">5+</span>
              <span className="text-sm text-slate-500 mt-1">mos @ L&T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{numProjects}</span>
              <span className="text-sm text-slate-500 mt-1">shipped projects</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{contributions}</span>
              <span className="text-sm text-slate-500 mt-1">GitHub commits/yr</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{numLanguages}</span>
              <span className="text-sm text-slate-500 mt-1">languages spoken</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
