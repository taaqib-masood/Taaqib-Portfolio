"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { experience, education, certifications, spokenLanguages } from "@/data/resume";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { VerticalLine } from "@/components/VerticalLine";
import { TokenText } from "@/components/TokenText";

type Exp = (typeof experience)[number];

/** Pinned timeline: vertical scroll drives the bullets sideways. Desktop + motion-allowed only. */
function PinnedTimeline({ exp }: { exp: Exp }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  useEffect(() => {
    const measure = () => track.current && setShift(Math.max(0, track.current.scrollWidth - track.current.clientWidth));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -shift]);

  return (
    <div ref={ref} className="hidden md:block motion-reduce:!hidden relative border-b border-border" style={{ height: `${exp.bullets.length * 45}vh` }}>
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
        <div className="grid grid-cols-12 border-b border-border">
          <div className="col-span-8 p-8 border-r border-border">
            <h3 className="text-[24px] font-bold uppercase tracking-[-0.01em] leading-[1.2]">{exp.role}</h3>
            <p className="text-[16px] font-semibold text-outline uppercase tracking-[0.02em] mt-2">{exp.company}</p>
          </div>
          <div className="col-span-4 p-8 pt-20 flex flex-col justify-between gap-4 text-[12px] uppercase font-semibold tracking-widest text-outline">
            <div className="flex justify-between"><span>{exp.period}</span><span>{exp.location}</span></div>
            <div className="h-[2px] bg-outline-variant">
              <motion.div className="h-full bg-primary origin-left" style={{ scaleX: scrollYProgress }} />
            </div>
          </div>
        </div>
        <div ref={track} className="flex-1 overflow-hidden flex items-center">
          <motion.ol style={{ x }} className="flex">
            {exp.bullets.map((bullet, i) => (
              <li key={i} className="w-[460px] shrink-0 border-r border-border px-8 py-6 flex flex-col gap-6">
                <span aria-hidden="true" className="text-[96px] font-black leading-none tracking-[-0.05em] opacity-40" style={{ WebkitTextStroke: "1px currentColor", WebkitTextFillColor: "transparent" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[16px] leading-[1.6]">{bullet}</p>
              </li>
            ))}
          </motion.ol>
        </div>
      </div>
    </div>
  );
}

export function Experience() {
  return (
    <section id="experience" className="max-w-[1440px] mx-auto border-b border-border">
      
      {/* Experience Header */}
      <div className="relative border-b border-border p-6 md:p-8 overflow-hidden">
        <ParallaxNumber number="06" />
        <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] relative z-10"><TokenText text="Experience" /></h2>
      </div>

      {experience.map((exp, idx) => <PinnedTimeline key={idx} exp={exp} />)}

      {/* Experience List: mobile and reduced-motion view */}
      <div className="md:hidden motion-reduce:!block">
        {experience.map((exp, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 border-b border-border"
          >
            <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 relative">
              <h3 className="text-[18px] md:text-[24px] font-bold uppercase tracking-[-0.01em] leading-[1.2] mb-2">{exp.role}</h3>
              <p className="text-[16px] font-semibold text-outline uppercase tracking-[0.02em] mb-4">{exp.company}</p>
              <div className="flex justify-between text-[12px] uppercase font-semibold tracking-widest text-outline">
                <span>{exp.period}</span>
                <span>{exp.location}</span>
              </div>
              <VerticalLine />
            </div>
            <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-center">
              <ul className="space-y-4">
                {exp.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-4 text-[16px] leading-[1.6]">
                    <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Education Header */}
      <div className="border-b border-border p-6 md:p-8 bg-surface-container-low">
        <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]"><TokenText text="Education" /></h2>
      </div>

      {/* Education List */}
      <div>
        {education.map((edu, idx) => (
          <motion.div
            key={`edu-${idx}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 border-b border-border"
          >
            <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 relative">
              <h3 className="text-[18px] md:text-[24px] font-bold uppercase tracking-[-0.01em] leading-[1.2] mb-2">{edu.institution}</h3>
              <VerticalLine />
            </div>
            <div className="lg:col-span-8 p-6 md:p-8">
              <p className="text-[16px] font-semibold uppercase tracking-[0.02em] mb-2">{edu.degree}</p>
              <p className="text-[14px] leading-[1.5] text-outline">{edu.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-6 md:p-8 border-b md:border-b-0 relative"
        >
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6 border-b border-border pb-4">Certifications</h3>
          <ul className="space-y-4">
            {certifications.map((cert, i) => (
              <li key={i} className="text-[14px] leading-[1.5] uppercase font-semibold">
                {cert}
              </li>
            ))}
          </ul>
          <VerticalLine />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-6 md:p-8"
        >
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6 border-b border-border pb-4">Languages</h3>
          <p className="text-[16px] leading-[1.6]">
            {spokenLanguages}
          </p>
        </motion.div>
      </div>

    </section>
  );
}
