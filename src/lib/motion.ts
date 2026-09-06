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
