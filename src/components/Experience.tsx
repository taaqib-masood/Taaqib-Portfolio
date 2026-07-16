"use client";

import { motion } from "framer-motion";
import { experience, education, certifications, spokenLanguages } from "@/data/resume";
import { Briefcase, GraduationCap, Award, Globe, ChevronRight } from "lucide-react";

export function Experience() {
  return (
    <section id="experience" className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 text-center"
      >
        <h2 className="font-heading text-4xl font-bold mb-4">Experience & Education</h2>
      </motion.div>

      <div className="relative border-l border-slate-800 ml-4 md:ml-8">
        {/* Experience Section */}
        {experience.map((exp, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 , ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 relative pl-10 md:pl-16"
          >
            <div className="absolute -left-[21px] top-1 bg-slate-950 border-2 border-violet-500 rounded-full p-2">
              <Briefcase className="h-5 w-5 text-violet-400" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-4">
              <h3 className="text-2xl font-bold text-white font-heading">{exp.role}</h3>
              <span className="text-violet-400 font-medium">@ {exp.company}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6 font-medium">
              <span>{exp.period}</span>
              <span>•</span>
              <span>{exp.location}</span>
            </div>

            <ul className="space-y-4">
              {exp.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 leading-relaxed">
                  <ChevronRight className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Education Section */}
        {education.map((edu, idx) => (
          <motion.div
            key={`edu-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) , ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 relative pl-10 md:pl-16"
          >
            <div className="absolute -left-[21px] top-1 bg-slate-950 border-2 border-slate-700 rounded-full p-2">
              <GraduationCap className="h-5 w-5 text-slate-400" />
            </div>

            <h3 className="text-xl font-bold text-white font-heading mb-1">{edu.degree}</h3>
            <p className="text-violet-400 font-medium mb-2">{edu.institution}</p>
            <p className="text-slate-400 text-sm">{edu.detail}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.4 , ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-slate-800"
      >
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-6 w-6 text-violet-400" />
            <h4 className="text-lg font-bold text-white font-heading">Certifications</h4>
          </div>
          <ul className="space-y-2">
            {certifications.map((cert, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-6 w-6 text-violet-400" />
            <h4 className="text-lg font-bold text-white font-heading">Languages</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {spokenLanguages}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
