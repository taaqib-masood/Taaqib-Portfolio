"use client";

import React, { useEffect } from "react";
import { projects } from "@/data/projects";
import { skills, aboutParagraphs, contact } from "@/data/resume";

export default function BrutalistPortfolio() {
  useEffect(() => {
    // 1. Custom Brutalist Cursor
    const cursor = document.querySelector(".custom-cursor") as HTMLElement;
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const target = e.target as HTMLElement;
        if (!target) return;
        
        // Determine if over dark section for inversion
        const darkSections = document.querySelectorAll('.dark, .footer-monolith');
        let isDark = false;
        darkSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (mouseY >= rect.top && mouseY <= rect.bottom) {
                isDark = true;
            }
        });

        if (isDark) cursor.classList.add("inverted");
        else cursor.classList.remove("inverted");

        // Hover States
        const isText = target.tagName && target.tagName.match(/H1|H2|H3|P|SPAN/) && !target.closest('.project-row') && !target.closest('.spec-cell') && !target.closest('.garage-link');
        const isCta = target.closest('.btn-magnet') || target.closest('.project-row') || target.closest('.garage-link');

        if (isCta) {
            cursor.classList.add("cta-hover");
            cursor.classList.remove("text-hover");
        } else if (isText) {
            cursor.classList.add("text-hover");
            cursor.classList.remove("cta-hover");
        } else {
            cursor.classList.remove("text-hover", "cta-hover");
        }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Smooth Cursor Loop (Hydraulic lerp approximation)
    function renderCursor() {
        cursorX += (mouseX - cursorX) * 0.4;
        cursorY += (mouseY - cursorY) * 0.4;
        if (cursor) {
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        }
        animationFrameId = requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // 2. Magnetic CTAs
    const magnets = document.querySelectorAll('.magnet');
    const handleMagnetMove = (e: Event) => {
        const btn = e.currentTarget as HTMLElement;
        const ev = e as MouseEvent;
        const rect = btn.getBoundingClientRect();
        const x = ev.clientX - rect.left - rect.width / 2;
        const y = ev.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    };
    const handleMagnetLeave = (e: Event) => {
        const btn = e.currentTarget as HTMLElement;
        btn.style.transform = `translate(0px, 0px)`;
    };
    
    magnets.forEach(btn => {
        btn.addEventListener('mousemove', handleMagnetMove);
        btn.addEventListener('mouseleave', handleMagnetLeave);
    });

    // 3. Chaos Tag Scramble Initialization
    const chaosContainer = document.querySelector(".chaos-container");
    if (chaosContainer) {
        const tags = chaosContainer.querySelectorAll(".chaos-tag");
        tags.forEach(t => {
            const tag = t as HTMLElement;
            const randX = (Math.random() - 0.5) * 800;
            const randY = (Math.random() - 0.5) * 600;
            const randRot = (Math.random() - 0.5) * 180;
            tag.style.transform = `translate(${randX}px, ${randY}px) rotate(${randRot}deg) scale(0.5)`;
            tag.style.opacity = '0';
        });
    }

    // 4. Scroll Logic (Hairline, Drift, Parallax)
    const progress = document.getElementById("progress-bar");
    const heroContent = document.querySelector(".hero-content") as HTMLElement;
    const numerals = document.querySelectorAll(".bg-numeral");

    const handleScroll = () => {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = Math.max(0, Math.min(1, scrolled / maxScroll));
        
        // Scroll-Progress Hairline
        if (progress) {
            progress.style.transform = `scaleX(${ratio})`;

            // Hairline Color Inversion
            const darkSections = document.querySelectorAll('.dark, .footer-monolith');
            let invertedProgress = false;
            darkSections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                if (rect.top <= 0 && rect.bottom >= 0) invertedProgress = true;
            });
            if (invertedProgress) progress.classList.add("inverted");
            else progress.classList.remove("inverted");
        }

        // Hero Drift
        if (heroContent) {
            const driftY = scrolled * 0.35;
            const opacity = Math.max(0, 1 - (scrolled / 600));
            heroContent.style.transform = `translateY(-${driftY}px)`;
            heroContent.style.opacity = opacity.toString();
        }

        // Parallax Numerals
        numerals.forEach(n => {
            const num = n as HTMLElement;
            const speed = parseFloat(num.getAttribute('data-speed') || '-0.3');
            if (num.parentElement) {
                const rect = num.parentElement.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const offset = (window.innerHeight - rect.top) * speed;
                    num.style.transform = `translateY(${offset}px)`;
                }
            }
        });
    };
    
    window.addEventListener("scroll", handleScroll);

    // 5. Intersection Observer for Reveals & Chaos Snap
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -10% 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                
                // Chaos Snap
                if (entry.target.classList.contains("chaos-section")) {
                    const chaos = entry.target.querySelector(".chaos-container");
                    if (chaos) chaos.classList.add("snapped");
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll(".reveal-group, .chaos-section, .footer-monolith").forEach(el => {
        observer.observe(el);
    });

    return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(animationFrameId);
        magnets.forEach(btn => {
            btn.removeEventListener('mousemove', handleMagnetMove);
            btn.removeEventListener('mouseleave', handleMagnetLeave);
        });
        observer.disconnect();
    };
  }, []);

  return (
    <div className="brutalist-theme">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .brutalist-theme {
            --ink: #0A0A0A;
            --paper: #d6d1c5;
            --faint: #c4bfb2;
            --hydraulic: cubic-bezier(0.83, 0, 0.17, 1);
            
            background-color: var(--paper);
            color: var(--ink);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            cursor: none;
        }

        /* Override global styles for this page */
        html, body {
            background-color: #d6d1c5 !important;
            color: #0A0A0A !important;
        }

        * {
            cursor: none !important;
        }

        .brutalist-theme ::selection {
            background-color: var(--ink);
            color: var(--paper);
        }

        /* Micro-Interactions: Custom Brutalist Cursor */
        .custom-cursor {
            position: fixed;
            top: 0; left: 0;
            width: 16px; height: 16px;
            border: 1px solid var(--ink);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%);
            transition: width 0.3s var(--hydraulic), height 0.3s var(--hydraulic), background-color 0.3s var(--hydraulic), border-color 0.3s var(--hydraulic);
        }
        .custom-cursor.text-hover {
            width: 4px; height: 4px;
            background-color: var(--ink);
        }
        .custom-cursor.cta-hover {
            width: 40px; height: 40px;
            background-color: var(--ink);
            z-index: 9998;
        }
        .custom-cursor.inverted {
            border-color: var(--paper);
        }
        .custom-cursor.inverted.text-hover, .custom-cursor.inverted.cta-hover {
            background-color: var(--paper);
        }

        /* Scroll-Progress Hairline */
        #progress-bar {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 2px;
            background-color: var(--ink);
            transform-origin: 0% 50%;
            transform: scaleX(0);
            z-index: 9999;
            transition: background-color 0.3s var(--hydraulic);
        }
        #progress-bar.inverted {
            background-color: white;
        }

        /* Typography */
        .brutalist-theme h1, .brutalist-theme h2, .brutalist-theme h3 {
            font-weight: 900;
            letter-spacing: -0.04em;
            text-transform: uppercase;
        }
        .brutalist-theme .mono {
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        /* Layout & Sections */
        .brutalist-theme section {
            position: relative;
            min-height: 100vh;
            padding: 15vh 5vw;
        }
        .brutalist-theme section.dark {
            background-color: var(--ink);
            color: var(--paper);
        }
        
        .brutalist-theme section.acrylic {
            margin-top: -15vh;
            padding-top: 25vh;
            z-index: 3;
            border-top: 1px solid var(--ink);
        }

        /* Brutalist Parallax Numerals */
        .bg-numeral {
            position: absolute;
            top: 5vh; right: 5vw;
            font-size: 350px;
            font-weight: 900;
            color: var(--faint);
            opacity: 0.3;
            z-index: 0;
            pointer-events: none;
            line-height: 0.8;
            letter-spacing: -0.05em;
        }
        .brutalist-theme section.dark .bg-numeral {
            color: #1a1a1a;
            opacity: 1;
        }

        .brutalist-theme .container {
            position: relative;
            z-index: 1;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Mechanical Stagger Reveals */
        .reveal-group .reveal-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s var(--hydraulic), transform 0.8s var(--hydraulic);
        }
        .reveal-group.in-view .reveal-item {
            opacity: 1;
            transform: translateY(0);
        }
        .reveal-group .reveal-item:nth-child(1) { transition-delay: 0.05s; }
        .reveal-group .reveal-item:nth-child(2) { transition-delay: 0.10s; }
        .reveal-group .reveal-item:nth-child(3) { transition-delay: 0.15s; }
        .reveal-group .reveal-item:nth-child(4) { transition-delay: 0.20s; }
        .reveal-group .reveal-item:nth-child(5) { transition-delay: 0.25s; }
        .reveal-group .reveal-item:nth-child(6) { transition-delay: 0.30s; }
        .reveal-group .reveal-item:nth-child(7) { transition-delay: 0.35s; }
        .reveal-group .reveal-item:nth-child(8) { transition-delay: 0.40s; }

        /* Hero Section */
        .brutalist-theme .hero {
            display: flex;
            align-items: center;
        }
        .hero-content {
            will-change: transform, opacity;
        }
        .hero-title {
            font-size: clamp(56px, 14vw, 180px);
            line-height: 0.85;
            margin-bottom: 6vh;
            max-width: 1200px;
        }
        .hero-about {
            font-size: clamp(16px, 2vw, 24px);
            max-width: 800px;
            line-height: 1.5;
            font-weight: 700;
            margin-left: 2vw;
        }
        .hero-about p {
            margin-bottom: 24px;
        }

        /* Magnetic CTAs */
        .btn-magnet {
            display: inline-block;
            padding: 1rem 3rem;
            border: 1px solid var(--ink);
            background: transparent;
            color: var(--ink);
            text-decoration: none;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            font-size: 20px;
            transition: transform 0.2s linear; 
            position: relative;
            z-index: 10;
        }
        .btn-magnet:hover {
            background: var(--ink) !important;
            color: var(--paper) !important;
            transition: background 0s, color 0s;
        }

        /* Chaos to Order Snap */
        .chaos-section {
            padding-top: 10vh;
        }
        .chaos-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 4rem;
            background: var(--faint);
            border: 1px solid var(--ink);
            margin-bottom: 10vh;
        }
        .chaos-tag {
            padding: 0.5rem 1rem;
            border: 1px solid var(--ink);
            background-color: var(--paper);
            color: var(--ink);
            font-weight: 700;
            font-size: 14px;
            transition: transform 1.2s var(--hydraulic), opacity 1.2s var(--hydraulic);
            will-change: transform, opacity;
        }
        .chaos-container.snapped .chaos-tag {
            transform: translate(0, 0) rotate(0deg) scale(1) !important;
            opacity: 1 !important;
        }

        /* Mechanical Spec Sheet (Skills) */
        .spec-sheet {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border-top: 1px solid var(--paper);
            border-left: 1px solid var(--paper);
        }
        @media (max-width: 1024px) {
            .spec-sheet { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
            .spec-sheet { grid-template-columns: 1fr; }
        }
        .spec-cell {
            border-right: 1px solid var(--paper);
            border-bottom: 1px solid var(--paper);
            padding: 2.5rem 2rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 220px;
        }
        .spec-label {
            font-size: 12px;
            opacity: 0.5;
            margin-bottom: 2rem;
        }
        .spec-value {
            font-size: clamp(24px, 3vw, 42px);
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        /* Terminal Project Log */
        .project-list {
            border-top: 1px solid var(--ink);
            margin-top: 10vh;
        }
        .project-row {
            display: flex;
            align-items: baseline;
            padding: 2.5rem 1rem;
            border-bottom: 1px solid var(--ink);
            text-decoration: none;
            color: var(--ink);
            position: relative;
            z-index: 10;
            transition: background-color 0.4s var(--hydraulic), color 0.4s var(--hydraulic), padding-left 0.4s var(--hydraulic), padding-right 0.4s var(--hydraulic);
        }
        .project-row:hover {
            background-color: var(--ink);
            color: var(--paper);
            padding-left: 2.5rem;
            padding-right: 2.5rem;
        }
        .project-index { width: 10%; font-size: 14px; opacity: 0.5; }
        .project-title { width: 45%; font-size: clamp(20px, 3vw, 48px); font-weight: 900; letter-spacing: -0.03em; }
        .project-stack { width: 35%; font-size: 12px; opacity: 0.7; }
        .project-arrow { width: 10%; text-align: right; font-size: 24px; font-weight: 400; }
        
        .project-row:hover .project-index,
        .project-row:hover .project-stack {
            opacity: 1;
        }

        /* Monolith Footer */
        .footer-monolith {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            position: relative;
            overflow: hidden;
            background-color: var(--ink);
            color: var(--paper);
            padding: 10vh 5vw;
            border-top: 1px solid var(--paper);
        }
        .ghost-svg {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 90vmin;
            height: 90vmin;
            opacity: 0.10;
            pointer-events: none;
            z-index: 0;
        }
        .ghost-svg path {
            fill: none;
            stroke: var(--paper);
            stroke-width: 1;
            stroke-dasharray: 4000;
            stroke-dashoffset: 4000;
        }
        .footer-monolith.in-view .ghost-svg path {
            animation: drawSvg 2.5s var(--hydraulic) forwards;
        }
        @keyframes drawSvg {
            to { stroke-dashoffset: 0; }
        }

        .footer-links {
            display: flex;
            gap: 4rem;
            justify-content: center;
            margin-bottom: 10vh;
            z-index: 10;
        }

        /* Garage Door Reveal */
        .garage-link {
            position: relative;
            text-decoration: none;
            color: var(--paper);
            font-size: clamp(16px, 2vw, 32px);
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            padding: 1rem 2rem;
            overflow: hidden;
            border: 1px solid var(--paper);
            display: inline-block;
        }
        .garage-door {
            position: absolute;
            bottom: 0; left: 0;
            width: 100%; height: 100%;
            background-color: var(--paper);
            transform: translateY(101%);
            transition: transform 0s;
            z-index: -1;
        }
        .garage-link:hover .garage-door {
            transform: translateY(0%);
            transition: transform 0.4s var(--hydraulic);
        }
        .garage-link:hover {
            color: var(--ink);
            transition: color 0s 0.25s; 
        }
        .garage-link:not(:hover) {
            color: var(--paper);
            transition: color 0s; 
        }
        .garage-link:not(:hover) .garage-door {
            transform: translateY(101%);
            transition: transform 0s;
        }

        .footer-wordmark {
            font-size: clamp(60px, 18vw, 300px);
            text-align: center;
            line-height: 0.8;
            white-space: nowrap;
            position: relative;
            z-index: 10;
            margin-bottom: 2rem;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 1s var(--hydraulic), opacity 1s var(--hydraulic);
        }
        .footer-monolith.in-view .footer-wordmark {
            transform: translateY(0);
            opacity: 1;
        }

        .footer-hairline {
            position: absolute;
            bottom: 0; left: 0;
            height: 1px;
            background-color: white; 
            width: 100%;
            transform-origin: 0 50%;
            transform: scaleX(0);
            transition: transform 1.5s var(--hydraulic);
            transition-delay: 0.5s;
        }
        .footer-monolith.in-view .footer-hairline {
            transform: scaleX(1);
        }
      `}} />

      <div id="progress-bar"></div>
      <div className="custom-cursor"></div>

      {/* 01 HERO */}
      <section className="hero" id="about">
          <div className="bg-numeral" data-speed="-0.3">01</div>
          <div className="container hero-content reveal-group">
              <h1 className="hero-title reveal-item">TAAQIB MASOOD</h1>
              <div className="hero-about">
                  {aboutParagraphs.map((p, idx) => (
                      <p key={idx} className="reveal-item">{p}</p>
                  ))}
                  <div className="reveal-item" style={{ marginTop: '4rem' }}>
                      <a href="#projects" className="btn-magnet magnet">View Works</a>
                  </div>
              </div>
          </div>
      </section>

      {/* 02 SKILLS / CHAOS TO ORDER */}
      <section className="dark acrylic chaos-section" id="skills">
          <div className="bg-numeral" data-speed="-0.3">02</div>
          <div className="container reveal-group">
              <h2 className="hero-title reveal-item" style={{ fontSize: 'clamp(40px, 8vw, 100px)' }}>CORE SYSTEMS</h2>
              
              <div className="chaos-container reveal-item">
                  {Object.values(skills).flat().map((skill, i) => (
                      <div key={i} className="chaos-tag mono">{skill}</div>
                  ))}
              </div>

              {/* Mechanical Spec Sheet */}
              <div className="spec-sheet reveal-item">
                  {Object.entries(skills).map(([category, items], i) => (
                      <div key={category} className="spec-cell">
                          <span className="spec-label mono">SYS.0{i+1} / {category.toUpperCase()}</span>
                          <span className="spec-value">{items.slice(0, 3).map(s => s.split(' ')[0].toUpperCase()).join(', ')}</span>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 03 SELECTED WORKS */}
      <section className="acrylic" id="projects" style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
          <div className="bg-numeral" data-speed="-0.3">03</div>
          <div className="container reveal-group">
              <h2 className="hero-title reveal-item" style={{ fontSize: 'clamp(40px, 8vw, 100px)' }}>SELECTED WORKS</h2>
              
              <div className="project-list reveal-item">
                  {projects.map((proj, i) => (
                      <a key={proj.slug} href={proj.demo || proj.repo} className="project-row" target="_blank" rel="noreferrer">
                          <span className="project-index mono">{(i + 1).toString().padStart(3, '0')}</span>
                          <span className="project-title">{proj.title}</span>
                          <span className="project-stack mono">{proj.stack.slice(0, 5).join(', ')}</span>
                          <span className="project-arrow">↗</span>
                      </a>
                  ))}
              </div>
          </div>
      </section>

      {/* 04 MONOLITH FOOTER */}
      <footer className="footer-monolith">
          <svg className="ghost-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M50 100 L50 20 M50 20 L20 50 M50 20 L80 50 M50 50 L30 30 M50 50 L70 30 M50 70 L20 80 M50 70 L80 80 M20 50 L30 70 M80 50 L70 70 M30 30 L10 40 M70 30 L90 40 M50 10 L50 0 M20 20 L50 50 M80 20 L50 50 M10 70 L50 90 M90 70 L50 90" />
          </svg>

          <div className="container reveal-group">
              <div className="footer-links reveal-item">
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" className="garage-link mono">
                      LINKEDIN
                      <div className="garage-door"></div>
                  </a>
                  <a href={contact.github} target="_blank" rel="noreferrer" className="garage-link mono">
                      GITHUB
                      <div className="garage-door"></div>
                  </a>
                  <a href={`mailto:${contact.email}`} className="garage-link mono">
                      EMAIL
                      <div className="garage-door"></div>
                  </a>
              </div>
          </div>

          <h1 className="footer-wordmark">LET&apos;S BUILD</h1>
          <div className="footer-hairline"></div>
      </footer>
    </div>
  );
}
