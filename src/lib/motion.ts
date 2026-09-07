export type MotionOrigin = { x: number; y: number };
export type RectLike = { left: number; top: number; width: number; height: number };
export type ViewportLike = { width: number; height: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function getTransitionOrigin(
  rect: RectLike | null,
  viewport: ViewportLike,
): MotionOrigin {
  if (!rect) return { x: viewport.width / 2, y: viewport.height / 2 };
  return {
    x: clamp(rect.left + rect.width / 2, 0, viewport.width),
    y: clamp(rect.top + rect.height / 2, 0, viewport.height),
  };
}

export function getCoverRadius(origin: MotionOrigin, viewport: ViewportLike) {
  return Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(viewport.width - origin.x, origin.y),
    Math.hypot(origin.x, viewport.height - origin.y),
    Math.hypot(viewport.width - origin.x, viewport.height - origin.y),
  );
}

export function getMotionMultiplier(viewportWidth: number) {
  return viewportWidth <= 640 ? 0.75 : 1;
}

export function shouldShowBackToTop(scrollY: number, viewportHeight: number) {
  return scrollY > viewportHeight * 0.72;
}

export function getProfileRevealToggleActions() {
  return "restart none none reset";
}

export type CollisionFrame = {
  xPercent: number;
  yPercent: number;
  rotation: number;
};

export type ProfileCollisionMotion = {
  impactScale: "scaleX" | "scaleY";
  first: CollisionFrame;
  second: CollisionFrame;
  contact: [CollisionFrame, CollisionFrame];
  rebound: [CollisionFrame, CollisionFrame];
};

export function getProfileCollisionMotion(viewportWidth: number): ProfileCollisionMotion {
  if (viewportWidth <= 900) {
    return {
      impactScale: "scaleX",
      first: { xPercent: 0, yPercent: -14, rotation: -1.4 },
      second: { xPercent: 0, yPercent: 14, rotation: 1.4 },
      contact: [
        { xPercent: 0, yPercent: 1.8, rotation: -0.35 },
        { xPercent: 0, yPercent: -1.8, rotation: 0.35 },
      ],
      rebound: [
        { xPercent: 0, yPercent: -0.9, rotation: -0.2 },
        { xPercent: 0, yPercent: 0.9, rotation: 0.2 },
      ],
    };
  }

  return {
    impactScale: "scaleY",
    first: { xPercent: -22, yPercent: 0, rotation: -3 },
    second: { xPercent: 22, yPercent: 0, rotation: 3 },
    contact: [
      { xPercent: 1.7, yPercent: 0, rotation: -0.35 },
      { xPercent: -1.7, yPercent: 0, rotation: 0.35 },
    ],
    rebound: [
      { xPercent: -1.15, yPercent: 0, rotation: -0.18 },
      { xPercent: 1.15, yPercent: 0, rotation: 0.18 },
    ],
  };
}
