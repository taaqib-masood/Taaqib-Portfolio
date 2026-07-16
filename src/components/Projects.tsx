"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, Project } from "@/data/projects";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ExternalLink, Terminal } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
import Image from "next/image";

const categories = ["All", "AI/LLM", "Full-Stack", "ML", "Edge"];

export function Projects({ onAskAgent }: { onAskAgent?: (title: string) => void }) {
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
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center"
      >
        <h2 className="font-heading text-4xl font-bold mb-4">Featured Work</h2>
        <p className="text-slate-400 text-lg">
          Systems engineered for reliability, performance, and real-world impact.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeFilter === category
                ? "bg-violet-600 text-white"
                : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, idx) => {
            const isFeature = project.slug === "ltts-proctoring-portal" || project.slug === "mcp-code-review-pipeline";
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 , ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
                key={project.slug}
                onClick={() => setSelectedProject(project)}
                className={`group cursor-pointer relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/50 transition-colors ${
                  isFeature ? "md:col-span-2" : "col-span-1"
                } ${project.slug === "ltts-proctoring-portal" ? "lg:row-span-2 lg:col-span-2" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedProject(project);
                  }
                }}
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={`/projects/${project.slug}.jpg`}
                    alt={project.title}
                    fill
                    className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>
                
                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.stack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-slate-800/80 text-xs backdrop-blur-sm border-slate-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold font-heading mb-2 text-white group-hover:text-violet-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {project.blurb}
                  </p>
                  <p className="text-sm font-medium text-violet-400">
                    {project.metrics[0]}
                  </p>
                  
                  <div className="absolute bottom-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-semibold text-white flex items-center gap-1 bg-violet-600/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                      View case study →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-2xl bg-slate-950/90 backdrop-blur-xl border-slate-800">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading mb-2">{selectedProject.title}</DialogTitle>
                <DialogDescription className="text-slate-400 text-base">
                  {selectedProject.blurb}
                </DialogDescription>
              </DialogHeader>
              
              <div className="my-6">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.stack.map((tech) => (
                    <Badge key={tech} variant="outline" className="border-slate-700 bg-slate-900/50">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Key Metrics & Outcomes</h4>
                <ul className="space-y-2">
                  {selectedProject.metrics.map((metric, i) => (
                    <li key={i} className="text-slate-300 flex items-start gap-2">
                      <span className="text-violet-500 mt-1">•</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6 pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 italic">
                  {selectedProject.role}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => selectedProject && handleAgentClick(selectedProject.title)}>
                  <Terminal className="h-4 w-4" />
                  Ask agent about this
                </Button>
                {selectedProject.repo && (
                  <a href={selectedProject.repo} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", className: "border-slate-700 hover:bg-slate-800 gap-2" })}>
                    <GithubIcon className="h-4 w-4" />
                    Repository
                  </a>
                )}
                {selectedProject.demo && (
                  <a href={selectedProject.demo} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", className: "border-slate-700 hover:bg-slate-800 gap-2" })}>
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
