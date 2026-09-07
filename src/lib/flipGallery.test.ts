import assert from "node:assert/strict";
import test from "node:test";

import { getFlipGalleryStep, getProfileCardTilt } from "./flipGallery.ts";

test("right-half clicks advance and wrap through all four photos", () => {
  assert.deepEqual(getFlipGalleryStep(2, 4, 80, 100), { direction: 1, nextIndex: 3 });
  assert.deepEqual(getFlipGalleryStep(3, 4, 80, 100), { direction: 1, nextIndex: 0 });
});

test("left-half clicks go backward and wrap to the last photo", () => {
  assert.deepEqual(getFlipGalleryStep(1, 4, 20, 100), { direction: -1, nextIndex: 0 });
  assert.deepEqual(getFlipGalleryStep(0, 4, 20, 100), { direction: -1, nextIndex: 3 });
});

test("maps each pointer corner to the full card tilt limit", () => {
  assert.deepEqual(
    getProfileCardTilt({ left: 100, top: 200, width: 400, height: 500 }, { clientX: 100, clientY: 200 }, 8),
    { rotationX: 8, rotationY: -8 },
  );
  assert.deepEqual(
    getProfileCardTilt({ left: 100, top: 200, width: 400, height: 500 }, { clientX: 500, clientY: 700 }, 8),
    { rotationX: -8, rotationY: 8 },
  );
});

test("keeps the card level at its center", () => {
  assert.deepEqual(
    getProfileCardTilt({ left: 0, top: 0, width: 400, height: 500 }, { clientX: 200, clientY: 250 }, 8),
    { rotationX: 0, rotationY: 0 },
  );
});
