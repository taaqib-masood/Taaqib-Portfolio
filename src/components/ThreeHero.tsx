"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// @ts-expect-error missing types
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";

function ParticleField(props: React.ComponentProps<typeof Points>) {
  const ref = useRef<THREE.Points>(null);
  const [sphere] = useState(() => random.inSphere(new Float32Array(3000), { radius: 1.5 }));

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
      
      // Gentle parallax effect with mouse
      ref.current.rotation.x += (state.pointer.y * 0.1 - ref.current.rotation.x) * 0.05;
      ref.current.rotation.y += (state.pointer.x * 0.1 - ref.current.rotation.y) * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function ThreeHero() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,rgba(15,23,42,1)_0%,rgba(45,27,105,1)_50%,rgba(15,23,42,1)_100%)] opacity-50 mix-blend-multiply" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ParticleField />
      </Canvas>
    </div>
  );
}
