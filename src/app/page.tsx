"use client";

import React, { useEffect, useState, useRef } from "react";
import { projects } from "@/data/projects";
import { skills, aboutParagraphs, contact } from "@/data/resume";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  
  const transport = React.useMemo(
    () => new DefaultChatTransport({ api: "/api/chat/stream" }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
  });
  
  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <button 
        className="chat-toggle"
        onClick={() => setIsOpen(true)}
      >
        <span className="mono hover-text">CHAT</span>
      </button>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span className="mono">AI.AGENT // ONLINE</span>
        <button className="chat-close mono" onClick={() => setIsOpen(false)}>X</button>
      </div>
      <div className="chat-messages mono">
        {messages.length === 0 && (
          <div className="chat-msg system">
            SYSTEM: Connection established. Ask about Taaqib&apos;s experience or projects.
          </div>
        )}
        {messages.map(m => {
          let textContent = "";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msgAny = m as any;
          if (msgAny.parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            textContent = msgAny.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("");
          } else {
            textContent = msgAny.content || "";
          }
          if (!textContent) return null;
          return (
            <div key={m.id} className={`chat-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
              <span className="msg-prefix">{m.role === 'user' ? 'USER:' : 'SYS:'}</span> {textContent}
            </div>
          );
        })}
        {isLoading && <div className="chat-msg assistant"><span className="msg-prefix">SYS:</span> <span className="cli-cursor inline"></span></div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ role: "user", parts: [{ type: "text", text: input.trim() }] });
        setInput("");
      }} className="chat-input-form">
        <input 
          className="chat-input mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TYPE MESSAGE..."
          autoFocus
        />
        <button type="submit" className="chat-submit mono" disabled={isLoading || !input.trim()}>
          {'>'}
        </button>
      </form>
    </div>
  );
}

export default function BrutalistPortfolio() {
  useEffect(() => {
    const snapContainer = document.querySelector('.snap-container') as HTMLElement;
    if (!snapContainer) return;

    // 1. Custom Brutalist Cursor
    const cursor = document.querySelector(".custom-cursor") as HTMLElement;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let animationFrameId: number;
    let marqueeOffset = 0;
    
    const checkDarkSection = () => {
        const darkSections = document.querySelectorAll('.dark, .footer-monolith');
        let isDark = false;
        darkSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            // Using viewport coordinates for standard check
            if (rect.top <= mouseY && rect.bottom >= mouseY) {
                isDark = true;
            }
        });
        if (cursor) {
            if (isDark) cursor.classList.add("inverted");
            else cursor.classList.remove("inverted");
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const target = e.target as HTMLElement;
        if (!target) return;
        
        checkDarkSection();

        const isText = target.tagName && target.tagName.match(/H1|H2|H3|P|SPAN/) && !target.closest('.project-row') && !target.closest('.inversion-band') && !target.closest('.garage-link');
        const isCta = target.closest('.btn-magnet') || target.closest('.project-row') || target.closest('.garage-link') || target.closest('.inversion-band') || target.closest('button') || target.closest('a');

        if (cursor) {
            if (isCta) {
                cursor.classList.add("cta-hover");
                cursor.classList.remove("text-hover");
            } else if (isText) {
                cursor.classList.add("text-hover");
                cursor.classList.remove("cta-hover");
            } else {
                cursor.classList.remove("text-hover", "cta-hover");
            }
        }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Text Scrambler Util
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const scrambleText = (el: HTMLElement) => {
        const originalText = el.getAttribute('data-text') || el.innerText;
        if (!el.getAttribute('data-text')) el.setAttribute('data-text', originalText);
        
        let iteration = 0;
        
        const scrambleInterval = setInterval(() => {
            el.innerText = originalText.split("").map((char, index) => {
                if (index < iteration) return originalText[index];
                if (char === " ") return " ";
                return chars[Math.floor(Math.random() * chars.length)];
            }).join("");
            
            if (iteration >= originalText.length) {
                clearInterval(scrambleInterval);
            }
            iteration += 1 / 3;
        }, 30);
    };

    // Smooth Cursor Loop & Marquee
    const marqueeContent = document.querySelector('.marquee-content') as HTMLElement;
    function renderFrame() {
        // Cursor Lerp
        cursorX += (mouseX - cursorX) * 0.4;
        cursorY += (mouseY - cursorY) * 0.4;
        if (cursor) {
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        }

        // Magnetic Marquee logic based on mouse X
        if (marqueeContent) {
            const normX = (mouseX / window.innerWidth) - 0.5; // -0.5 to +0.5
            const speed = 1.5 + (normX * 3); // 0 to 3
            marqueeOffset -= speed * 0.05; // Use percentage
            if (marqueeOffset <= -50) marqueeOffset = 0;
            if (marqueeOffset > 0) marqueeOffset = -50;
            marqueeContent.style.transform = `translateX(${marqueeOffset}%)`;
        }

        animationFrameId = requestAnimationFrame(renderFrame);
    }
    renderFrame();

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

    // 4. Scroll Logic (Parallax & Hairline on snap container)
    const progress = document.getElementById("progress-bar");
    const numerals = document.querySelectorAll(".bg-numeral");

    const handleScroll = () => {
        const scrolled = snapContainer.scrollTop;
        const maxScroll = snapContainer.scrollHeight - snapContainer.clientHeight;
        const ratio = Math.max(0, Math.min(1, scrolled / maxScroll));
        
        checkDarkSection();

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

        // Snap-based Parallax Numerals
        numerals.forEach(n => {
            const num = n as HTMLElement;
            const speed = parseFloat(num.getAttribute('data-speed') || '-0.3');
            if (num.parentElement) {
                // Determine offset relative to viewport
                const rect = num.parentElement.getBoundingClientRect();
                // When rect.top is 0, the section is fully snapped.
                const offset = rect.top * speed;
                num.style.transform = `translateY(${offset}px)`;
            }
        });
    };
    snapContainer.addEventListener("scroll", handleScroll);

    // 5. Intersection Observer for Snap Reveals & Scrambler
    const observerOptions = { threshold: 0.15 }; // Fire when 15% snapped in
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!entry.target.classList.contains("in-view")) {
                    entry.target.classList.add("in-view");
                    // Trigger scrambler on headings
                    const scrambles = entry.target.querySelectorAll(".scramble-text");
                    scrambles.forEach(el => scrambleText(el as HTMLElement));
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll(".snap-section").forEach(el => observer.observe(el));

    return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        snapContainer.removeEventListener("scroll", handleScroll);
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
            overflow: hidden; /* Hide main scrollbar */
        }

        * {
            cursor: none !important;
        }

        .monolith-theme ::selection {
            background-color: var(--ink);
            color: var(--paper);
        }

        /* Snap Architecture */
        .snap-container {
            height: 100vh;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
            /* Hide scrollbar for aesthetics */
            scrollbar-width: none;
        }
        .snap-container::-webkit-scrollbar {
            display: none;
        }

        .snap-section {
            scroll-snap-align: start;
            scroll-snap-stop: always;
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            overflow: hidden;
            padding: 10vh 5vw;
        }

        /* Acrylic Snap Reveal */
        .acrylic-reveal {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            transform: translateY(100%);
            opacity: 0;
            transition: transform 0.8s var(--hydraulic), opacity 0.8s var(--hydraulic);
        }
        .snap-section.in-view .acrylic-reveal {
            transform: translateY(0%);
            opacity: 1;
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

        /* Colors */
        .monolith-theme .dark {
            background-color: var(--ink);
            color: var(--paper);
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
        .monolith-theme .dark .bg-numeral {
            color: #1a1a1a;
            opacity: 1;
        }

        .container {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
        }

        .hero-title-masked {
            font-size: clamp(56px, 14vw, 180px);
            line-height: 0.85;
            margin-bottom: 6vh;
            display: flex;
            flex-direction: column;
        }
        .mask-wrapper {
            overflow: hidden;
            border-bottom: 1px solid var(--ink);
            width: fit-content;
        }
        .mask-text {
            display: inline-block;
            transform: translateY(-100%);
            opacity: 0;
            transition: transform 0.8s var(--hydraulic), opacity 0.8s var(--hydraulic);
        }
        .snap-section.in-view .mask-text {
            transform: translateY(0%);
            opacity: 1;
        }
        
        .hero-layout {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 4vw;
            width: 100%;
            align-items: center;
        }
        .hero-text {
            max-width: 800px;
        }
        .hero-photo-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            width: 100%;
        }
        
        .brutalist-photo-spec {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 450px;
        }
        
        .brutalist-photo-label {
            font-size: 12px;
            padding: 8px 0;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .brutalist-photo-container {
            width: 100%;
            aspect-ratio: 3/4;
            border: 1px solid var(--ink);
            overflow: hidden;
            position: relative;
        }

        .brutalist-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: grayscale(20%);
            display: block;
        }

        .hero-about {
            font-size: clamp(16px, 2vw, 24px);
            line-height: 1.5;
            font-weight: 700;
        }
        
        /* CLI Typewriter */
        .cli-word {
            opacity: 0;
        }
        .cli-word.revealed {
            opacity: 1;
        }
        .cli-cursor.inline {
            display: inline-block;
            width: 10px; height: 10px;
            background-color: currentColor;
            margin-left: 5px;
            margin-bottom: 2px;
            animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        /* Magnetic CTAs */
        .btn-magnet {
            display: inline-flex;
            align-items: center;
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

        /* Marquee */
        .marquee-wrapper {
            position: absolute;
            bottom: 0;
            left: 0; width: 100%;
            overflow: hidden;
            border-top: 1px solid var(--ink);
            background: var(--ink);
            color: var(--paper);
            padding: 1rem 0;
            z-index: 10;
        }
        .marquee-content {
            display: flex;
            width: 200%;
            font-size: 24px;
            font-weight: bold;
            will-change: transform;
        }
        .marquee-content span {
            width: 50%;
            display: block;
            text-align: center;
        }

        /* Massive Inversion Bands */
        .bands-container {
            margin-top: 5vh;
            width: 100%;
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
            margin-top: 5vh;
            width: 100%;
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
            background-color: var(--ink);
            color: var(--paper);
            border-top: 1px solid var(--paper);
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
            margin-bottom: 5vh;
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
            font-size: clamp(40px, 8vw, 100px);
            text-align: center;
            line-height: 0.8;
            white-space: nowrap;
            position: relative;
            z-index: 10;
            margin-bottom: 2rem;
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

        /* Chat Widget */
        .chat-toggle {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 40px;
            height: 40px;
            background-color: var(--ink);
            color: var(--ink); /* hidden by default */
            border: 1px solid var(--ink);
            z-index: 9999;
            cursor: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: width 0.3s var(--hydraulic), background-color 0s;
            overflow: hidden;
        }
        .chat-toggle:hover {
            width: 100px;
            background-color: var(--paper);
            border-color: var(--ink);
            color: var(--ink);
        }
        .chat-toggle .hover-text {
            opacity: 0;
            transition: opacity 0.1s;
            font-size: 14px;
            font-weight: 700;
        }
        .chat-toggle:hover .hover-text {
            opacity: 1;
        }
        
        .chat-window {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 300px;
            height: 400px;
            background-color: var(--paper);
            border: 1px solid var(--ink);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 0 0 transparent; /* No shadow */
        }
        .chat-header {
            padding: 10px;
            background: var(--ink);
            color: var(--paper);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            font-weight: bold;
        }
        .chat-close {
            background: transparent;
            color: var(--paper);
            border: none;
            cursor: none;
            font-weight: bold;
        }
        .chat-messages {
            flex-grow: 1;
            padding: 15px;
            overflow-y: auto;
            font-size: 12px;
            line-height: 1.4;
            scrollbar-width: none;
        }
        .chat-messages::-webkit-scrollbar { display: none; }
        
        .chat-msg { margin-bottom: 10px; }
        .chat-msg.system { color: #888; }
        .chat-msg.assistant { color: var(--ink); }
        .chat-msg.user { color: var(--ink); text-align: right; }
        .msg-prefix { font-weight: bold; }
        
        .chat-input-form {
            display: flex;
            border-top: 1px solid var(--ink);
        }
        .chat-input {
            flex-grow: 1;
            background: transparent;
            border: none;
            padding: 15px;
            color: var(--ink);
            font-size: 12px;
            outline: none;
        }
        .chat-submit {
            background: var(--ink);
            color: var(--paper);
            border: none;
            padding: 0 15px;
            font-weight: bold;
            cursor: none;
        }
      `}} />

      <div id="progress-bar"></div>
      <div className="custom-cursor"></div>
      
      <ChatWidget />

      <div className="snap-container">
          
          {/* 01 HERO */}
          <section className="snap-section hero" id="about">
              <div className="bg-numeral" data-speed="-0.1">01</div>
              <div className="container hero-content acrylic-reveal">
                  <div className="hero-layout">
                      <div className="hero-text">
                          <h1 className="hero-title-masked">
                              <div className="mask-wrapper"><span className="mask-text" style={{ transitionDelay: '0s' }}>TAAQIB</span></div>
                              <div className="mask-wrapper"><span className="mask-text" style={{ transitionDelay: '0.1s' }}>MASOOD</span></div>
                          </h1>
                          <div className="hero-about">
                              <p style={{ minHeight: '100px' }}>
                                {aboutParagraphs.join(" ").split(" ").map((word, idx) => (
                                  <span key={idx}>
                                    <span className="cli-word">{word}</span>
                                    <span> </span>
                                  </span>
                                ))}
                                <span className="cli-cursor inline"></span>
                              </p>
                              <div style={{ display: 'flex', gap: '20px', marginTop: '4rem' }}>
                                  <a href="#projects" className="btn-magnet magnet">View Works</a>
                                  <a href="/assets/cv.pdf" download className="btn-magnet magnet">Download CV</a>
                              </div>
                          </div>
                      </div>
                      
                      <div className="hero-photo-wrapper">
                          <div className="brutalist-photo-spec">
                              <span className="brutalist-photo-label mono">SUBJECT: TAAQIB MASOOD</span>
                              <div className="brutalist-photo-container">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src="/taaqib-photo.jpg" alt="Taaqib Masood" className="brutalist-photo" />
                              </div>
                              <span className="brutalist-photo-label mono" style={{ textAlign: 'right' }}>LOC: DUBAI, UAE // STATUS: ACTIVE</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="marquee-wrapper">
                  <div className="marquee-content mono">
                      <span>AVAILABLE FOR WORK // DUBAI, UAE // AI ENGINEER // </span>
                      <span>AVAILABLE FOR WORK // DUBAI, UAE // AI ENGINEER // </span>
                  </div>
              </div>
          </section>

          {/* 02 SKILLS / MASSIVE INVERSION BANDS */}
          <section className="snap-section" id="skills">
              <div className="bg-numeral" data-speed="-0.1">02</div>
              <div className="container acrylic-reveal">
                  <h2 className="hero-title scramble-text" style={{ fontSize: 'clamp(40px, 8vw, 100px)' }}>CORE SYSTEMS</h2>
                  
                  <div className="bands-container">
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
          <section className="snap-section dark" id="projects">
              <div className="bg-numeral" data-speed="-0.1">03</div>
              <div className="container acrylic-reveal">
                  <h2 className="hero-title scramble-text" style={{ fontSize: 'clamp(40px, 8vw, 100px)' }}>SELECTED WORKS</h2>
                  
                  <div className="project-list">
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
          <footer className="snap-section footer-monolith dark">
              <div className="acrylic-reveal" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                  <svg className="botanical-svg" viewBox="0 0 200 200" preserveAspectRatio="none">
                      <path d="M100 200 L100 20 C100 20, 140 40, 160 20 C160 20, 140 80, 100 100 C100 100, 60 40, 40 20 C40 20, 60 80, 100 100 M100 120 C100 120, 130 130, 150 110 C150 110, 130 160, 100 140 M100 140 C100 140, 70 130, 50 110 C50 110, 70 160, 100 140" />
                  </svg>

                  <div className="container">
                      <div className="footer-links">
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

                  <h1 className="footer-wordmark scramble-text">LET&apos;S BUILD</h1>
                  <div className="footer-hairline"></div>
              </div>
          </footer>
          
      </div>
    </div>
  );
}
