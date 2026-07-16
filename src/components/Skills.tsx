"use client";

import { motion } from "framer-motion";
import { skills } from "@/data/resume";
import { Badge } from "@/components/ui/badge";

const primarySkills = [
  "TypeScript", "Python", "Anthropic Claude", "Groq (LLaMA 3.1 / 3.3)", "MCP tooling", "RAG", "Angular 18/19 (standalone components, RxJS)", "Node.js"
];

export function Skills() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section id="skills" className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] as const }}
        className="mb-16 text-center"
      >
        <h2 className="font-heading text-4xl font-bold mb-4">Technical Skills</h2>
      </motion.div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {Object.entries(skills).map(([category, items]) => (
          <motion.div
            key={category}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="break-inside-avoid bg-slate-900/40 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-slate-200 mb-6 font-heading border-b border-slate-800 pb-2">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => {
                const isPrimary = primarySkills.includes(skill);
                return (
                  <motion.div key={skill} variants={item}>
                    <Badge
                      variant="secondary"
                      className={`
                        transition-all hover:scale-105 cursor-default
                        ${isPrimary 
                          ? "bg-violet-600/20 text-violet-300 border-violet-500/30 font-semibold text-sm px-3 py-1.5" 
                          : "bg-slate-800/60 text-slate-300 border-slate-700/50 text-xs px-2.5 py-1"}
                      `}
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
