"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface RevealOnScrollProps {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
}

export default function RevealOnScroll({
  children,
  variants = fadeUp,
  delay = 0,
  className = "",
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
