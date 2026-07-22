"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, Project } from "@/data/projects";
import { ParallaxNumber } from "@/components/ParallaxNumber";
import { VerticalLine } from "@/components/VerticalLine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Terminal, ArrowUpRight } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const categories = ["All", "AI/LLM", "Full-Stack", "ML", "Edge"];

function getMetricTooltip(metric: string): string | null {
  if (metric.includes("gaze-tracking")) return "MediaPipe Face Landmarker + solvePnP head-pose";
  if (metric.includes("multi-face detection")) return "face-api.js with COCO-SSD fallbacks";
  if (metric.includes("security issues")) return "Static analysis via Claude MCP agent cross-referencing Jama specs";
  if (metric.includes("risk rules")) return "Real-time portfolio delta tracking and regime-switching gates";
  if (metric.includes("UAE VAT-compliant payments")) return "Stripe Connect + Square POS API integration";
  if (metric.includes("TensorFlow Lite")) return "Quantized INT8 models for edge deployment";
  return null;
}

export function Projects({ onAskAgent, activeSkill }: { onAskAgent?: (title: string) => void, activeSkill?: string | null }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter((project) =>
    activeFilter === "All"
      ? true
      : project.categories.includes(activeFilter)
  );

  const handleAgentClick = (title: string) => {
    setSelectedProject(null);
    if (onAskAgent) {
      onAskAgent(title);
    } else {
      const agentEl = document.getElementById("agent");
      agentEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="projects" className="max-w-[1440px] mx-auto border-b border-border">
      
      {/* Header & Filters */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 border-b border-border overflow-hidden">
        <ParallaxNumber number="01" />
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 relative flex items-center">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] relative z-10">Projects</h2>
          <VerticalLine />
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 flex flex-wrap gap-4 items-center bg-surface">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 border border-border text-[12px] font-semibold uppercase tracking-widest transition-colors ${
                activeFilter === category
                  ? "bg-foreground text-surface"
                  : "bg-surface text-foreground hover:bg-surface-container"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, idx) => {
            const isFeature = project.slug === "ltts-proctoring-portal" || project.slug === "mcp-code-review-pipeline";
            const matchesSkill = activeSkill ? project.stack.includes(activeSkill) : true;
            const isFaded = activeSkill && !matchesSkill;
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.83, 0, 0.17, 1], delay: idx * 0.05 }}
                key={project.slug}
                onClick={() => { if (!isFaded) setSelectedProject(project); }}
                className={`group cursor-pointer relative border-b md:border-r border-border p-6 md:p-8 flex flex-col justify-between min-h-[300px] overflow-hidden transition-all duration-300 ${
                  isFeature ? "md:col-span-2" : "col-span-1"
                } ${project.slug === "ltts-proctoring-portal" ? "lg:row-span-2 lg:col-span-2" : ""} ${
                  isFaded ? "opacity-20 pointer-events-none" : ""
                } ${activeSkill && matchesSkill ? "border border-[#2e5bff]" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                     e.preventDefault();
                     setSelectedProject(project);
                  }
                }}
              >
                {/* Base Layer: Blue Background */}
                <div className="absolute inset-0 bg-[#1d4ed8] z-0" />
                
                {/* Base Layer: Image (if applicable) */}
                {project.image && project.slug === "ltts-proctoring-portal" && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-60 z-0"
                    style={{ backgroundImage: `url(${project.image})` }}
                  />
                )}
                
                {/* Garage Door Layer (White Overlay) */}
                <div 
                  className="absolute inset-0 bg-surface z-10 translate-y-0 group-hover:-translate-y-full"
                  style={{ transition: "transform 0.4s cubic-bezier(0.83, 0, 0.17, 1)" }}
                />
                
                {/* Content Layer */}
                <div className="relative z-20 flex flex-col h-full justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-4 text-outline group-hover:text-surface/80 transition-colors duration-400">
                        {project.categories[0]} / {new Date().getFullYear()}
                      </h4>
                      <h3 className="text-[24px] md:text-[32px] font-bold tracking-[-0.03em] leading-[1.1] mb-6 uppercase text-foreground group-hover:text-surface group-hover:drop-shadow-md transition-colors duration-400">
                        {project.title}
                      </h3>
                    </div>
                    <ArrowUpRight className="h-6 w-6 text-surface opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-400 ease-[cubic-bezier(0.83,0,0.17,1)]" />
                  </div>
                  
                  <div>
                    <div className="h-px w-full bg-border group-hover:bg-surface/20 mb-4 transition-colors duration-400" />
                    <p className="text-[14px] leading-[1.5] mb-4 text-outline group-hover:text-surface line-clamp-2 transition-colors duration-400">
                      {project.blurb}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 border border-border group-hover:border-surface/50 text-outline group-hover:text-surface group-hover:bg-surface/10 text-[10px] uppercase font-semibold tracking-wider transition-colors duration-400 backdrop-blur-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.83, 0, 0.17, 1], delay: filteredProjects.length * 0.05 }}
            onClick={() => {
              const agentEl = document.getElementById("agent");
              agentEl?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group cursor-pointer relative border-b md:border-r border-border p-6 md:p-8 flex flex-col justify-between transition-all duration-500 hover:z-10 min-h-[300px] overflow-hidden bg-foreground text-surface col-span-1 md:col-span-2"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <h3 className="text-[32px] md:text-[64px] font-black tracking-[-0.03em] leading-[0.9] mb-6 uppercase drop-shadow-md">
                  AGENT<br/>TERMINAL
                </h3>
                <ArrowUpRight className="h-6 w-6 text-surface opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 ease-out" />
              </div>
              <div>
                <div className="h-px w-full bg-surface/20 mb-4" />
                <p className="text-[14px] leading-[1.5] mb-4 text-surface/80 drop-shadow-sm">
                  Interface directly with the TAAQIB system. Query tech stacks, availability, and neural paradigms.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 border border-surface/20 text-surface text-[10px] uppercase font-semibold tracking-wider">
                    SYSTEM
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-5xl w-[95vw] bg-surface border border-border p-0 rounded-none gap-0 max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <div className="p-8 border-b border-border bg-surface">
                <DialogHeader>
                  <DialogTitle className="text-[32px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1] mb-4 text-foreground">
                    {selectedProject.title}
                  </DialogTitle>
                  <DialogDescription className="text-[16px] md:text-[18px] leading-[1.5] text-foreground/80 max-w-2xl">
                    {selectedProject.blurb}
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 border-b md:border-b-0 md:border-r border-border">
                  <h4 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6">Key Metrics & Outcomes</h4>
                  <ul className="space-y-4">
                    {selectedProject.metrics.map((metric, i) => {
                      const tooltip = getMetricTooltip(metric);
                      return (
                        <li key={i} className="text-[14px] leading-[1.5] flex items-start gap-3 relative group/tooltip">
                          <span className="w-1.5 h-1.5 bg-foreground mt-1.5 flex-shrink-0" />
                          <span className={tooltip ? "border-b border-dotted border-black cursor-help" : ""}>
                            {metric}
                          </span>
                          {tooltip && (
                            <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none bg-black text-white border border-[#ffffff] rounded-none px-3 py-2 z-50 text-[10px] uppercase tracking-wider min-w-[200px] max-w-xs shadow-none">
                              {tooltip}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-6">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedProject.stack.map((tech) => (
                        <span key={tech} className="px-3 py-1.5 border border-border text-[12px] uppercase font-semibold tracking-wider bg-surface-container-low">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      className="w-full flex items-center justify-between border border-border bg-primary text-on-primary px-4 py-3 text-[12px] font-semibold uppercase tracking-widest hover:bg-foreground hover:text-surface transition-colors" 
                      onClick={() => selectedProject && handleAgentClick(selectedProject.title)}
                    >
                      <span className="flex items-center gap-2"><Terminal className="h-4 w-4" /> Ask Agent</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <div className="flex gap-3">
                      {selectedProject.repo && (
                        <a href={selectedProject.repo} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 border border-border bg-surface px-4 py-3 text-[12px] font-semibold uppercase tracking-widest hover:bg-foreground hover:text-surface transition-colors">
                          <GithubIcon className="h-4 w-4" /> Repo
                        </a>
                      )}
                      {selectedProject.demo && (
                        <a href={selectedProject.demo} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 border border-border bg-surface px-4 py-3 text-[12px] font-semibold uppercase tracking-widest hover:bg-foreground hover:text-surface transition-colors">
                          <ExternalLink className="h-4 w-4" /> Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
