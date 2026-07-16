"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Briefcase, 
  Code2, 
  Terminal, 
  MessageSquare, 
  FileText, 
  Sparkles,
  Command as CommandIcon
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const scrollTo = (id: string) => {
    if (window.location.pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Trigger Button (Optional floating or fixed somewhere, but usually Cmd+K is just keyboard. We add a subtle floating one here for mobile/discoverability) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-md transition-all hover:border-violet-500/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 md:hidden shadow-xl"
        aria-label="Open command menu"
      >
        <CommandIcon className="h-4 w-4" />
        <span>Menu</span>
      </button>

      <AnimatePresence>
        {open && (
          <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 , ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[90vw] max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
            >
              <div className="flex items-center border-b border-slate-800 px-4">
                <Command.Input 
                  autoFocus 
                  placeholder="Type a command or search..." 
                  className="w-full bg-transparent py-4 text-slate-200 placeholder-slate-500 focus:outline-none text-base"
                />
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
                <Command.Empty className="py-10 text-center text-sm text-slate-500">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-xs font-medium text-slate-500 px-2 py-2">
                  <Item onSelect={() => runCommand(() => scrollTo("about"))} icon={<User />} label="About Me" />
                  <Item onSelect={() => runCommand(() => scrollTo("projects"))} icon={<Code2 />} label="Projects" />
                  <Item onSelect={() => runCommand(() => scrollTo("skills"))} icon={<Terminal />} label="Skills & Tech" />
                  <Item onSelect={() => runCommand(() => scrollTo("experience"))} icon={<Briefcase />} label="Experience" />
                  <Item onSelect={() => runCommand(() => scrollTo("contact"))} icon={<MessageSquare />} label="Contact" />
                </Command.Group>

                <Command.Separator className="my-2 h-px bg-slate-800" />

                <Command.Group heading="AI Tools" className="text-xs font-medium text-slate-500 px-2 py-2">
                  <Item onSelect={() => runCommand(() => scrollTo("agent"))} icon={<Sparkles className="text-violet-400" />} label="Ask the Agent" />
                  <Item onSelect={() => runCommand(() => router.push("/playground"))} icon={<Terminal className="text-violet-400" />} label="Groq Playground" />
                </Command.Group>

                <Command.Separator className="my-2 h-px bg-slate-800" />

                <Command.Group heading="Links" className="text-xs font-medium text-slate-500 px-2 py-2">
                  <Item onSelect={() => runCommand(() => window.open("/resume.pdf", "_blank"))} icon={<FileText />} label="Download CV" />
                  <Item onSelect={() => runCommand(() => window.open("https://github.com/taaqib-masood", "_blank"))} icon={<GithubIcon />} label="View GitHub" />
                </Command.Group>
              </Command.List>

              <div className="border-t border-slate-800 bg-slate-950/50 px-4 py-3 text-xs text-slate-500 flex justify-between items-center hidden sm:flex">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-sans">↑</kbd><kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-sans">↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-sans">Enter</kbd> to select</span>
                </div>
                <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-sans">Esc</kbd> to close</span>
              </div>
            </motion.div>
          </Command.Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

function Item({ onSelect, icon, label }: { onSelect: () => void; icon: React.ReactNode; label: string }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition-colors aria-selected:bg-violet-600 aria-selected:text-white"
    >
      <div className="flex h-5 w-5 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>
      {label}
    </Command.Item>
  );
}
