export type FlipDirection = 1 | -1;

type TiltRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type TiltPointer = {
  clientX: number;
  clientY: number;
};

export function getProfileCardTilt(rect: TiltRect, pointer: TiltPointer, limit = 8) {
  if (rect.width <= 0 || rect.height <= 0) return { rotationX: 0, rotationY: 0 };

  const normalizedX = Math.max(-1, Math.min(1, ((pointer.clientX - rect.left) / rect.width - 0.5) * 2));
  const normalizedY = Math.max(-1, Math.min(1, ((pointer.clientY - rect.top) / rect.height - 0.5) * 2));

  return {
    rotationX: -normalizedY * limit || 0,
    rotationY: normalizedX * limit || 0,
  };
}

export function getFlipGalleryStep(
  currentIndex: number,
  itemCount: number,
  pointerX: number,
  width: number,
) {
  if (itemCount < 1) return { direction: 1 as FlipDirection, nextIndex: 0 };

  const direction: FlipDirection = pointerX < width / 2 ? -1 : 1;
  return {
    direction,
    nextIndex: (currentIndex + direction + itemCount) % itemCount,
  };
}
