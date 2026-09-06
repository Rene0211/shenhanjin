import { useRef } from "react";
import { gsap, motionDuration, motionEase, prefersReducedMotion, useGSAP } from "../lib/gsap";
import { getCoverRadius, type MotionOrigin } from "../lib/motion";

export type TransitionRequest = {
  id: number;
  origin: MotionOrigin;
};

type PageTransitionLayerProps = {
  request: TransitionRequest | null;
  onCovered: () => void;
  onComplete: () => void;
};

export function PageTransitionLayer({ request, onCovered, onComplete }: PageTransitionLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const onCoveredRef = useRef(onCovered);
  const onCompleteRef = useRef(onComplete);
  onCoveredRef.current = onCovered;
  onCompleteRef.current = onComplete;

  useGSAP(() => {
    const layer = layerRef.current;
    if (!layer || !request) return;

    if (prefersReducedMotion()) {
      onCoveredRef.current();
      onCompleteRef.current();
      return;
    }

    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const radius = Math.ceil(getCoverRadius(request.origin, viewport)) + 8;
    const closed = `circle(0px at ${request.origin.x}px ${request.origin.y}px)`;
    const open = `circle(${radius}px at ${request.origin.x}px ${request.origin.y}px)`;

    gsap.set(layer, { visibility: "visible", pointerEvents: "auto", clipPath: closed, autoAlpha: 1 });
    gsap.timeline({
      defaults: { ease: motionEase.emphasized, overwrite: "auto" },
      onComplete: () => {
        gsap.set(layer, { visibility: "hidden", pointerEvents: "none", autoAlpha: 0, clipPath: closed });
        onCompleteRef.current();
      },
    })
      .to(layer, {
        clipPath: open,
        duration: motionDuration.routeCover,
      })
      .call(() => onCoveredRef.current())
      .to(layer, {
        autoAlpha: 0,
        duration: motionDuration.routeReveal,
        ease: motionEase.soft,
      });
  }, { scope: layerRef, dependencies: [request?.id], revertOnUpdate: true });

  return <div ref={layerRef} className="page-transition-layer" aria-hidden="true" />;
}
