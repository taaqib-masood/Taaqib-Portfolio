"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { contact } from "@/data/resume";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
    <section id="contact" className="max-w-[1440px] mx-auto border-b border-border relative z-10">
      
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
        <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center">
          <h2 className="text-[24px] md:text-[48px] font-bold uppercase tracking-[-0.03em] leading-[1]">Contact</h2>
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 bg-surface-container-low flex flex-col justify-center">
          <p className="text-[16px] leading-[1.5] uppercase font-semibold tracking-widest text-outline">
            Open to AI Engineering and AI-integrated full-stack roles — based in Dubai, available immediately.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-6 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-surface"
        >
          <div className="p-6 md:p-8 flex-1">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-8 border-b border-border pb-4">Contact Information</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <Mail className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-[16px] font-medium hover:text-outline transition-colors">{contact.email}</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <Phone className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Phone</p>
                  <a href={`tel:${contact.phone}`} className="text-[16px] font-medium hover:text-outline transition-colors">{contact.phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1">
                  <MapPin className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Location</p>
                  <p className="text-[16px] font-medium">{contact.residency}</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="border-t border-border grid grid-cols-3">
            <a 
              href={contact.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 flex items-center justify-center border-r border-border hover:bg-foreground hover:text-surface transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="h-6 w-6" />
            </a>
            <a 
              href={contact.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 flex items-center justify-center border-r border-border hover:bg-foreground hover:text-surface transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="h-6 w-6" />
            </a>
            <a 
              href={contact.liveDemo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 flex items-center justify-center hover:bg-foreground hover:text-surface transition-colors gap-3"
              aria-label="Live Demo"
            >
              <ExternalLink className="h-6 w-6" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-6"
        >
          <div className="bg-surface h-full flex flex-col p-6 md:p-8">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.02em] mb-8 border-b border-border pb-4">Send a message</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-outline">Name</label>
                <input id="name" placeholder="John Doe" className="w-full border border-border bg-surface px-4 py-3 text-[16px] focus:outline-none focus:border-primary transition-colors" {...register("name")} />
                {errors.name && <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-outline">Email</label>
                <input id="email" type="email" placeholder="john@example.com" className="w-full border border-border bg-surface px-4 py-3 text-[16px] focus:outline-none focus:border-primary transition-colors" {...register("email")} />
                {errors.email && <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2 flex-1 flex flex-col">
                <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-outline">Message</label>
                <textarea id="message" placeholder="How can I help you?" className="w-full flex-1 min-h-[160px] border border-border bg-surface px-4 py-3 text-[16px] focus:outline-none focus:border-primary transition-colors resize-none" {...register("message")} />
                {errors.message && <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mt-1">{errors.message.message}</p>}
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-foreground text-on-primary hover:text-surface transition-colors py-4 text-[14px] font-bold uppercase tracking-widest flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
