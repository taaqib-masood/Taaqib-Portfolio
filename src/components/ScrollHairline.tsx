"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollHairline() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      id="scroll-hairline"
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#2e5bff] origin-left z-50 pointer-events-none"
      style={{ scaleX }}
    />
  );
}
