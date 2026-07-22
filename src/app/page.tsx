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
    
    const checkDarkSection = () => {
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
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const target = e.target as HTMLElement;
        if (!target) return;
        
        checkDarkSection();

        // Hover States
        const isText = target.tagName && target.tagName.match(/H1|H2|H3|P|SPAN/) && !target.closest('.project-row') && !target.closest('.inversion-band') && !target.closest('.garage-link');
        const isCta = target.closest('.btn-magnet') || target.closest('.project-row') || target.closest('.garage-link') || target.closest('.inversion-band');

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

    // Smooth Cursor Loop
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

    // 3. CLI Typewriter
    const words = document.querySelectorAll('.cli-word');
    let wordIndex = 0;
    const typeInterval = setInterval(() => {
        if (wordIndex < words.length) {
            words[wordIndex].classList.add('revealed');
            wordIndex++;
        } else {
            clearInterval(typeInterval);
        }
    }, 40);

    // 4. Scroll Logic
    const progress = document.getElementById("progress-bar");
    const heroContent = document.querySelector(".hero-content") as HTMLElement;
    const numerals = document.querySelectorAll(".bg-numeral");

    const handleScroll = () => {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = Math.max(0, Math.min(1, scrolled / maxScroll));
        
        checkDarkSection();

        // Scroll-Progress Hairline
        if (progress) {
            progress.style.transform = `scaleX(${ratio})`;
            let invertedProgress = false;
            const darkSections = document.querySelectorAll('.dark, .footer-monolith');
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

    // 5. Intersection Observer
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -10% 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
            }
        });
    }, observerOptions);

    document.querySelectorAll(".reveal-group, .footer-monolith").forEach(el => {
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
        clearInterval(typeInterval);
        observer.disconnect();
    };
  }, []);

  return (
    <div className="monolith-theme">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .monolith-theme {
            --ink: #0A0A0A;
            --paper: #F4F4F0;
            --faint: #E8E8E4;
            --hydraulic: cubic-bezier(0.83, 0, 0.17, 1);
            
            background-color: var(--paper);
            color: var(--ink);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            cursor: none;
        }

        html, body {
            background-color: #F4F4F0 !important;
            color: #0A0A0A !important;
        }

        * {
            cursor: none !important;
        }

        .monolith-theme ::selection {
            background-color: var(--ink);
            color: var(--paper);
        }

        /* Cursor */
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

        /* Progress Hairline */
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
        .monolith-theme h1, .monolith-theme h2, .monolith-theme h3 {
            font-weight: 900;
            letter-spacing: -0.04em;
            text-transform: uppercase;
        }
        .monolith-theme .mono {
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        /* Sections */
        .monolith-theme section {
            position: relative;
            min-height: 100vh;
            padding: 15vh 5vw;
        }
        .monolith-theme section.dark {
            background-color: var(--ink);
            color: var(--paper);
        }
        .monolith-theme section.acrylic {
            margin-top: -15vh;
            padding-top: 25vh;
            z-index: 3;
            border-top: 1px solid var(--ink);
        }
        .monolith-theme section.dark.acrylic {
            border-top: 1px solid var(--paper);
        }

        /* Parallax Numerals */
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
        .monolith-theme section.dark .bg-numeral {
            color: #1a1a1a;
            opacity: 1;
        }

        .monolith-theme .container {
            position: relative;
            z-index: 1;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Stagger Reveals */
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

        /* Hero */
        .monolith-theme .hero {
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
        
        /* CLI Typewriter */
        .cli-word {
            opacity: 0;
        }
        .cli-word.revealed {
            opacity: 1;
        }
        .cli-cursor {
            display: inline-block;
            width: 10px; height: 10px;
            background-color: var(--ink);
            margin-left: 5px;
            margin-bottom: 4px;
            animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

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
            margin-top: 4rem;
        }
        .btn-magnet:hover {
            background: var(--ink) !important;
            color: var(--paper) !important;
            transition: background 0s, color 0s;
        }

        /* Massive Inversion Bands */
        .bands-container {
            margin-top: 10vh;
        }
        .inversion-band {
            position: relative;
            width: 100%;
            height: 100px;
            overflow: hidden;
            border-top: 1px solid var(--ink);
            background-color: var(--paper);
            color: var(--ink);
            cursor: none;
        }
        .inversion-band:last-child {
            border-bottom: 1px solid var(--ink);
        }
        
        .inversion-band::before {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            width: 100%; height: 100%;
            background-color: var(--ink);
            transform-origin: bottom;
            transform: scaleY(0);
            transition: transform 0.4s var(--hydraulic);
            z-index: 1;
        }

        .inversion-band-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding: 0 2vw;
            transform-origin: center;
            transition: transform 0.4s var(--hydraulic), color 0.4s var(--hydraulic);
        }

        .inversion-band:hover::before {
            transform: scaleY(1);
        }
        
        .inversion-band:hover .inversion-band-content {
            transform: scaleY(1.4);
            color: var(--paper);
        }

        .band-category {
            font-size: clamp(24px, 4vw, 48px);
            font-weight: 900;
            letter-spacing: -0.04em;
            text-transform: uppercase;
        }
        
        .band-skills {
            font-size: 14px;
            opacity: 0.7;
            text-align: right;
            max-width: 50%;
        }

        /* Terminal Project Log */
        .project-list {
            border-top: 1px solid var(--paper);
            margin-top: 10vh;
        }
        .project-row {
            display: flex;
            align-items: baseline;
            padding: 2.5rem 1rem;
            border-bottom: 1px solid var(--paper);
            text-decoration: none;
            color: var(--paper);
            position: relative;
            z-index: 10;
            overflow: hidden;
            transition: padding-left 0.4s var(--hydraulic), padding-right 0.4s var(--hydraulic);
        }
        .project-row::before {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            width: 100%; height: 100%;
            background-color: var(--paper);
            transform: translateY(101%);
            transition: transform 0s;
            z-index: -1;
        }
        .project-row:hover::before {
            transform: translateY(0%);
            transition: transform 0.4s var(--hydraulic);
        }
        .project-row:hover {
            color: var(--ink);
            padding-left: 2.5rem;
            padding-right: 2.5rem;
            transition: color 0s 0.25s, padding-left 0.4s var(--hydraulic), padding-right 0.4s var(--hydraulic);
        }
        .project-row:not(:hover) {
            color: var(--paper);
            transition: color 0s;
        }
        .project-row:not(:hover)::before {
            transform: translateY(101%);
            transition: transform 0s;
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
            margin-top: -15vh;
            padding-top: 25vh;
            z-index: 3;
        }
        
        /* Botanical SVG motif */
        .botanical-svg {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100vmin;
            height: 100vmin;
            opacity: 0.10;
            pointer-events: none;
            z-index: 0;
        }
        .botanical-svg path {
            fill: none;
            stroke: var(--paper);
            stroke-width: 1;
            stroke-dasharray: 5000;
            stroke-dashoffset: 5000;
        }
        .footer-monolith.in-view .botanical-svg path {
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
            background-color: var(--paper); 
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
              <div className="hero-about reveal-item">
                  <p>
                    {aboutParagraphs.join(" ").split(" ").map((word, idx) => (
                      <span key={idx}>
                        <span className="cli-word">{word}</span>
                        <span> </span>
                      </span>
                    ))}
                    <span className="cli-cursor"></span>
                  </p>
                  <a href="#projects" className="btn-magnet magnet">View Works</a>
              </div>
          </div>
      </section>

      {/* 02 SKILLS / MASSIVE INVERSION BANDS */}
      <section id="skills">
          <div className="bg-numeral" data-speed="-0.3">02</div>
          <div className="container reveal-group">
              <h2 className="hero-title reveal-item" style={{ fontSize: 'clamp(40px, 8vw, 100px)' }}>CORE SYSTEMS</h2>
              
              <div className="bands-container reveal-item">
                  {Object.entries(skills).map(([category, items]) => (
                      <div key={category} className="inversion-band">
                          <div className="inversion-band-content">
                              <span className="band-category">{category}</span>
                              <span className="band-skills mono">{items.join(', ')}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 03 SELECTED WORKS */}
      <section className="dark acrylic" id="projects">
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
          <svg className="botanical-svg" viewBox="0 0 200 200" preserveAspectRatio="none">
              {/* Minimal geometric botanical stem/leaf motif */}
              <path d="M100 200 L100 20 C100 20, 140 40, 160 20 C160 20, 140 80, 100 100 C100 100, 60 40, 40 20 C40 20, 60 80, 100 100 M100 120 C100 120, 130 130, 150 110 C150 110, 130 160, 100 140 M100 140 C100 140, 70 130, 50 110 C50 110, 70 160, 100 140" />
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
