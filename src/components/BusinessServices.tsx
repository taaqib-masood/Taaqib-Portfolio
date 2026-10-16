"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/components/LocaleProvider";

const services = [
  {
    title: "Booking and service-business systems",
    description: "Bookings, customer records, staff schedules, and deposits in one clear workflow.",
    evidence: "Salon Booking SaaS (UAE)",
    href: "/projects/salon-booking-saas",
  },
  {
    title: "Admin panels and AI workflows",
    description: "Manage operations with role-based tools, reliable automation, and AI where it helps.",
    evidence: "GarageIQ: UAE Garage Intelligence",
    href: "/projects/garageiq",
  },
];

export function BusinessServices() {
  const t = useT();

  return (
    <section id="services" aria-labelledby="services-title" className="max-w-[1440px] mx-auto border-b border-border">
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-border">
        <div className="lg:col-span-4 p-6 md:p-8 lg:border-r border-border">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant mb-3">01 / {t("For businesses")}</p>
          <h2 id="services-title" className="text-[24px] md:text-[40px] font-bold uppercase tracking-[-0.03em] leading-[1]">{t("Services")}</h2>
        </div>
        <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-between gap-6 bg-surface">
          <p className="max-w-[58ch] text-[16px] md:text-[18px] leading-[1.55]">{t("I build software for local businesses and product teams.")}</p>
          <Link href="/#contact" className="inline-flex min-h-12 items-center justify-between gap-4 self-start border border-foreground bg-foreground px-4 text-[11px] font-bold uppercase tracking-widest text-background hover:bg-primary hover:text-foreground transition-colors">
            {t("Discuss a project")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {services.map((service, index) => (
          <article key={service.href} className={`flex flex-col justify-between gap-8 p-6 md:p-8 ${index === 0 ? "md:border-r border-b md:border-b-0 border-border" : ""}`}>
            <div>
              <h3 className="max-w-[20ch] text-[22px] md:text-[28px] font-bold uppercase tracking-[-0.03em] leading-[1.1]">{t(service.title)}</h3>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.6] text-on-surface-variant">{t(service.description)}</p>
            </div>
            <Link href={service.href} className="group flex min-h-14 items-center justify-between gap-4 border-t border-border pt-4 text-[12px] font-bold uppercase tracking-widest hover:text-primary transition-colors">
              <span><span className="block text-[10px] text-on-surface-variant">{t("Project evidence")}</span>{t(service.evidence)}</span>
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 rtl:-scale-x-100" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
