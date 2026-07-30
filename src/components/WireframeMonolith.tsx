"use client";

import { useEffect, useState, useRef } from "react";

export function WireframeMonolith() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const x = ((e.clientY - cy) / cy) * 8;
      const y = ((e.clientX - cx) / cx) * -8;
      setTilt({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const W = 200;
  const H = 300;
  const D = 120;

  const faceStyle = (transform: string): React.CSSProperties => ({
    position: "absolute",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.02)",
    willChange: "transform",
    transform,
  });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes monolith-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>

      <div
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            width: W,
            height: H,
            position: "relative",
            transformStyle: "preserve-3d",
            animation: "monolith-spin 25s linear infinite",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.6s cubic-bezier(0.83, 0, 0.17, 1)",
            willChange: "transform",
          }}
          className="scale-[0.6] md:scale-100"
        >
          {/* Front */}
          <div style={{
            ...faceStyle(`translateZ(${D / 2}px)`),
            width: W, height: H,
          }} />
          {/* Back */}
          <div style={{
            ...faceStyle(`translateZ(${-D / 2}px) rotateY(180deg)`),
            width: W, height: H,
          }} />
          {/* Left */}
          <div style={{
            ...faceStyle(`translateX(${-D / 2}px) rotateY(-90deg)`),
            width: D, height: H,
            left: (W - D) / 2,
          }} />
          {/* Right */}
          <div style={{
            ...faceStyle(`translateX(${W - D / 2}px) rotateY(90deg)`),
            width: D, height: H,
            left: (W - D) / 2 - W + D,
          }} />
          {/* Top */}
          <div style={{
            ...faceStyle(`translateY(${-D / 2}px) rotateX(90deg)`),
            width: W, height: D,
            top: (H - D) / 2,
          }} />
          {/* Bottom */}
          <div style={{
            ...faceStyle(`translateY(${H - D / 2}px) rotateX(-90deg)`),
            width: W, height: D,
            top: (H - D) / 2 - H + D,
          }} />
        </div>
      </div>
    </div>
  );
}
