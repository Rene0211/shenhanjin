import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const motionQuery = {
  reduce: "(prefers-reduced-motion: reduce)",
  finePointer: "(pointer: fine)",
  desktop: "(min-width: 900px)",
} as const;

export const motionDuration = {
  fast: 0.18,
  normal: 0.45,
  slow: 0.7,
  routeCover: 0.68,
  routeReveal: 0.32,
  headingReveal: 0.72,
} as const;

export const motionValue = {
  mediaEntranceScale: 1.055,
  projectHoverScale: 1.04,
  projectPointerShift: 5,
  scrollParallax: 4,
  mobileMultiplier: 0.75,
} as const;

export const motionEase = {
  standard: "power3.out",
  soft: "power2.out",
  emphasized: "power3.inOut",
} as const;

export const motionStagger = {
  tight: 0.06,
  normal: 0.1,
  loose: 0.14,
} as const;

export const motionPreset = {
  enterUp: {
    autoAlpha: 0,
    y: 24,
    duration: motionDuration.slow,
    ease: motionEase.standard,
  },
  enterSoft: {
    autoAlpha: 0,
    y: 12,
    duration: motionDuration.normal,
    ease: motionEase.soft,
  },
  imageReveal: {
    autoAlpha: 0,
    scale: 0.98,
    duration: motionDuration.slow,
    ease: motionEase.standard,
  },
  hoverLift: {
    y: -2,
    duration: motionDuration.fast,
    ease: motionEase.soft,
  },
} as const;

gsap.defaults({
  duration: motionDuration.normal,
  ease: motionEase.standard,
  overwrite: "auto",
});

export function prefersReducedMotion() {
  return window.matchMedia(motionQuery.reduce).matches;
}

export { gsap, ScrollTrigger, useGSAP };
