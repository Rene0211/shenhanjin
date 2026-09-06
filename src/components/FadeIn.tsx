import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

type FadeInProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
};

export function FadeIn({
  as = "div",
  children,
  className,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
}: FadeInProps) {
  const Component = motion.create(as);

  return (
    <Component
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Component>
  );
}
