"use client";

import { motion } from "framer-motion";
import { experience, education, certifications, spokenLanguages } from "@/data/resume";

export function Experience() {
  return (
    <section id="experience" className="max-w-[1440px] mx-auto border-b border-border">
      
      {/* Experience Header */}
      <div className="border-b border-border p-6 md:p-8">
        <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]">Experience</h2>
      </div>

      {/* Experience List */}
      <div>
        {experience.map((exp, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 border-b border-border"
          >
            <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border">
              <h3 className="text-[18px] md:text-[24px] font-bold uppercase tracking-[-0.01em] leading-[1.2] mb-2">{exp.role}</h3>
              <p className="text-[16px] font-semibold text-outline uppercase tracking-[0.02em] mb-4">{exp.company}</p>
              <div className="flex justify-between text-[12px] uppercase font-semibold tracking-widest text-outline">
                <span>{exp.period}</span>
                <span>{exp.location}</span>
              </div>
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
        <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]">Education</h2>
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
            <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border">
              <h3 className="text-[18px] md:text-[24px] font-bold uppercase tracking-[-0.01em] leading-[1.2] mb-2">{edu.institution}</h3>
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
          className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border"
        >
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6 border-b border-border pb-4">Certifications</h3>
          <ul className="space-y-4">
            {certifications.map((cert, i) => (
              <li key={i} className="text-[14px] leading-[1.5] uppercase font-semibold">
                {cert}
              </li>
            ))}
          </ul>
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
