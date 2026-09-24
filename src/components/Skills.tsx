"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { skills } from "@/data/resume";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { VerticalLine } from "@/components/VerticalLine";
import { TokenText } from "@/components/TokenText";
import { useT } from "@/components/LocaleProvider";

const SHOWN = 6;

export function Skills({ 
  activeSkill, 
  onSkillSelect 
}: { 
  activeSkill?: string | null; 
  onSkillSelect?: (skill: string | null) => void; 
}) {
  const t = useT();
  const [open, setOpen] = useState<Set<string>>(new Set());
  return (
    <section id="skills" className="max-w-[1440px] mx-auto border-b border-border">
      <div className="relative grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <ParallaxNumber number="05" />
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 relative flex items-start">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] relative z-10"><TokenText text="Skills" /></h2>
          <VerticalLine />
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2">
          {Object.entries(skills).map(([category, items], idx, arr) => (
            <motion.div
              key={category}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`relative p-6 md:p-8 ${idx < arr.length - 2 ? "border-b border-border" : ""} ${idx === arr.length - 2 && arr.length % 2 === 0 ? "border-b border-border md:border-b-0" : ""} bg-surface`}
            >
              {idx % 2 === 0 && <VerticalLine />}
              <motion.h3 
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.83, 0, 0.17, 1] } }
                }}
                className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6 border-b border-border pb-4"
              >
                {t(category)}
              </motion.h3>
              <motion.div 
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.83, 0, 0.17, 1] } }
                }}
                className="flex flex-wrap gap-2"
              >
                {items.map((skill, i) => {
                  const isActive = activeSkill === skill;
                  // Phones: first SHOWN chips, then "+N more" (an active skill always stays visible).
                  const folded = i >= SHOWN && !open.has(category) && !isActive;
                  return (
                    <button
                      key={skill}
                      onClick={() => onSkillSelect?.(isActive ? null : skill)}
                      className={`px-3 py-1.5 max-sm:min-h-10 border border-border text-[12px] font-semibold uppercase tracking-widest transition-colors duration-300 ${folded ? "max-md:hidden" : ""} ${
                        isActive 
                          ? "bg-[#2e5bff] text-white border-[#2e5bff]" 
                          : "bg-surface text-foreground hover:bg-foreground hover:text-surface"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
                {items.length > SHOWN && !open.has(category) && (
                  <button
                    onClick={() => setOpen(new Set(open).add(category))}
                    className="md:hidden px-3 min-h-10 border border-dashed border-border text-[12px] font-semibold uppercase tracking-widest text-outline"
                  >
                    +{items.length - SHOWN} {t("more")}
                  </button>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
