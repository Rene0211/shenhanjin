import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type AnimatedTextProps = {
  text: string;
  className?: string;
};

export function AnimatedText({ text, className }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });
  const chars = Array.from(text);

  return (
    <p ref={ref} className={className} aria-label={text}>
      {chars.map((char, index) => (
        <AnimatedChar key={`${char}-${index}`} char={char} index={index} total={chars.length} progress={scrollYProgress} />
      ))}
    </p>
  );
}

function AnimatedChar({
  char,
  index,
  total,
  progress,
}: {
  char: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = Math.min(1, start + 0.18);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  return (
    <span className="relative inline-block whitespace-pre">
      <span className="invisible">{char}</span>
      <motion.span aria-hidden="true" className="absolute inset-0" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}
