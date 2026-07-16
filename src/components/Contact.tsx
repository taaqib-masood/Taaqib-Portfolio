"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { contact } from "@/data/resume";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, ExternalLink, Loader2 } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      toast.success("Message sent successfully!", {
        description: "I will get back to you as soon as possible.",
      });
      reset();
    } catch {
      toast.error("Failed to send message.", {
        description: "Please try again later or contact me directly via email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 , ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 text-center"
      >
        <h2 className="font-heading text-4xl font-bold mb-4">Get in touch</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Open to AI Engineering and AI-integrated full-stack roles — based in Dubai, available immediately.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 , ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-8"
        >
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
            <h3 className="font-heading text-2xl font-bold text-white mb-6">Contact Information</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 text-slate-300">
                <div className="bg-violet-500/10 p-3 rounded-full border border-violet-500/20">
                  <Mail className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <a href={`mailto:${contact.email}`} className="font-medium hover:text-violet-400 transition-colors">{contact.email}</a>
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-300">
                <div className="bg-violet-500/10 p-3 rounded-full border border-violet-500/20">
                  <Phone className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <a href={`tel:${contact.phone}`} className="font-medium hover:text-violet-400 transition-colors">{contact.phone}</a>
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-300">
                <div className="bg-violet-500/10 p-3 rounded-full border border-violet-500/20">
                  <MapPin className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium">{contact.residency}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-slate-800 flex gap-4">
              <a 
                href={contact.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-800/80 p-3 rounded-full hover:bg-violet-600 hover:text-white transition-all text-slate-400"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a 
                href={contact.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-800/80 p-3 rounded-full hover:bg-violet-600 hover:text-white transition-all text-slate-400"
                aria-label="GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a 
                href={contact.liveDemo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-800/80 p-3 rounded-full hover:bg-violet-600 hover:text-white transition-all text-slate-400 flex items-center gap-2 px-4"
                aria-label="Live Demo"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="text-sm font-medium">Live Demo</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 , ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl h-full">
            <h3 className="font-heading text-2xl font-bold text-white mb-6">Send a message</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <Input id="name" placeholder="John Doe" className="bg-slate-950/50 border-slate-800 focus-visible:ring-violet-500" {...register("name")} />
                {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-slate-950/50 border-slate-800 focus-visible:ring-violet-500" {...register("email")} />
                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-300">Message</Label>
                <Textarea id="message" placeholder="How can I help you?" className="min-h-[120px] bg-slate-950/50 border-slate-800 focus-visible:ring-violet-500" {...register("message")} />
                {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
