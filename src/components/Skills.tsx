"use client";

import { motion } from "framer-motion";
import { skills } from "@/data/resume";

export function Skills() {
  return (
    <section id="skills" className="max-w-[1440px] mx-auto border-b border-border">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border flex items-start">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]">Skills</h2>
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2">
          {Object.entries(skills).map(([category, items], idx, arr) => (
            <motion.div
              key={category}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`p-6 md:p-8 ${idx % 2 === 0 ? "border-r border-border" : ""} ${idx < arr.length - 2 ? "border-b border-border" : ""} ${idx === arr.length - 2 && arr.length % 2 === 0 ? "border-b border-border md:border-b-0" : ""} bg-surface`}
            >
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6 border-b border-border pb-4">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 border border-border text-[12px] font-semibold uppercase tracking-widest bg-surface text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
