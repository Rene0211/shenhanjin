type RevealRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type RevealPointer = {
  clientX: number;
  clientY: number;
};

export function getRadialRevealMetrics(rect: RevealRect, pointer: RevealPointer) {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 50, y: 50, maxRadiusPercent: 0 };
  }

  const localX = Math.max(0, Math.min(rect.width, pointer.clientX - rect.left));
  const localY = Math.max(0, Math.min(rect.height, pointer.clientY - rect.top));
  const unit = Math.hypot(rect.width, rect.height) / Math.SQRT2;
  const farthestCorner = Math.max(
    Math.hypot(localX, localY),
    Math.hypot(rect.width - localX, localY),
    Math.hypot(localX, rect.height - localY),
    Math.hypot(rect.width - localX, rect.height - localY),
  );

  return {
    x: (localX / rect.width) * 100,
    y: (localY / rect.height) * 100,
    maxRadiusPercent: (farthestCorner / unit) * 100 + 2,
  };
}
