"use client";

export function ScrollFloor3D() {
  return (
    <>
      <style>{`
        @keyframes grid-scroll {
          from { background-position: 0 0; }
          to { background-position: 0 40px; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="fixed bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: 200,
          zIndex: 1,
          opacity: 0.08,
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "bottom center",
          willChange: "transform, background-position",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          animation: "grid-scroll 2s linear infinite",
        }}
      />
    </>
  );
}
