import { useEffect, useRef, useState, type ReactNode } from "react";

type MagnetProps = {
  children: ReactNode;
  className?: string;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
};

export function Magnet({
  children,
  className,
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: "translate3d(0,0,0)", transition: inactiveTransition });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const onMove = (event: PointerEvent) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left - padding &&
        event.clientX <= rect.right + padding &&
        event.clientY >= rect.top - padding &&
        event.clientY <= rect.bottom + padding;

      if (!inside) {
        setStyle({ transform: "translate3d(0,0,0)", transition: inactiveTransition });
        return;
      }

      const x = (event.clientX - (rect.left + rect.width / 2)) / strength;
      const y = (event.clientY - (rect.top + rect.height / 2)) / strength;
      setStyle({ transform: `translate3d(${x}px, ${y}px, 0)`, transition: activeTransition });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [activeTransition, inactiveTransition, padding, strength]);

  return (
    <div ref={ref} className={className} style={{ ...style, willChange: "transform" }}>
      {children}
    </div>
  );
}
