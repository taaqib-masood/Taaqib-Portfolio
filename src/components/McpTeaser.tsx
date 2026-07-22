"use client";

import { motion } from "framer-motion";
import { Terminal, Crosshair } from "lucide-react";

export function McpTeaser() {
  const handleWakeUp = () => {
    // Actually, to pre-fill the agent from outside, we need a global state or to pass an event.
    // The prompt says "scrolls up to the Agent.tsx section and pre-fills the input with 'Access Neural Web'".
    // Since page.tsx already has handleAskAgentAboutProject which sets `agentPrefill`,
    // maybe I should dispatch a custom event, or just let the user type.
    // Wait, let's just scroll for now, or use a custom event since we don't have the prop passed down.
    const evt = new CustomEvent("wakeUpAgent", { detail: "Access Neural Web" });
    window.dispatchEvent(evt);
    const agentEl = document.getElementById("agent");
    agentEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="max-w-[1440px] mx-auto border-b border-border bg-[#ffffff] text-[#000000] overflow-hidden relative min-h-[400px] flex flex-col md:flex-row">
      {/* Brutalist + Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0v40M0 20h40' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative z-10 p-6 md:p-12 md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#333333]">
        <div className="flex items-center gap-3 mb-6">
          <Crosshair className="h-6 w-6 text-[#2e5bff]" />
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]">Neural Web</h2>
        </div>
        <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-[#a1a1aa] mb-8">
          Explore the neural architecture of TAAQIB.MASOOD. This node provides direct access to the central logic core and project synapses.
        </p>
        <button
          onClick={handleWakeUp}
          className="group flex items-center justify-between border border-[#000000] bg-transparent px-6 py-4 text-[14px] font-bold uppercase tracking-widest transition-colors hover:bg-[#000000] hover:text-[#ffffff] active:bg-[#e2e2e2] w-fit"
        >
          <span className="flex items-center gap-3">
            <Terminal className="h-5 w-5" />
            Wake Up Agent
          </span>
        </button>
      </div>
      
      <div className="relative z-10 p-6 md:p-12 md:w-1/2 flex flex-col justify-center items-center">
         {/* Abstract Neural Node Visualization */}
         <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[150px] h-[150px] border border-[#2e5bff] rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-[100px] h-[100px] border border-[#ffffff] rounded-none rotate-45"
            />
            <div className="absolute w-[20px] h-[20px] bg-[#2e5bff]" />
         </div>
      </div>
    </section>
  );
}
