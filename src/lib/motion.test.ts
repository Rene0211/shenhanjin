import test from "node:test";
import assert from "node:assert/strict";
import {
  getCoverRadius,
  getMotionMultiplier,
  getTransitionOrigin,
} from "./motion.ts";
import * as motion from "./motion.ts";

test("uses the clicked card center as transition origin", () => {
  assert.deepEqual(
    getTransitionOrigin(
      { left: 100, top: 80, width: 200, height: 120 },
      { width: 1000, height: 800 },
    ),
    { x: 200, y: 140 },
  );
});

test("uses viewport center without a source rectangle", () => {
  assert.deepEqual(getTransitionOrigin(null, { width: 1000, height: 800 }), {
    x: 500,
    y: 400,
  });
});

test("radius covers the furthest viewport corner", () => {
  assert.equal(Math.ceil(getCoverRadius({ x: 0, y: 0 }, { width: 3, height: 4 })), 5);
});

test("mobile timing uses the approved multiplier", () => {
  assert.equal(getMotionMultiplier(640), 0.75);
  assert.equal(getMotionMultiplier(641), 1);
});

test("back-to-top control appears only after meaningful detail scrolling", () => {
  const shouldShowBackToTop = (motion as Record<string, unknown>).shouldShowBackToTop;
  assert.equal(typeof shouldShowBackToTop, "function");
  assert.equal((shouldShowBackToTop as (scrollY: number, viewportHeight: number) => boolean)(500, 800), false);
  assert.equal((shouldShowBackToTop as (scrollY: number, viewportHeight: number) => boolean)(700, 800), true);
});

test("profile cards collide horizontally on desktop and vertically on mobile", () => {
  const getProfileCollisionMotion = (motion as Record<string, unknown>).getProfileCollisionMotion;
  assert.equal(typeof getProfileCollisionMotion, "function");

  const getMotion = getProfileCollisionMotion as (viewportWidth: number) => {
    impactScale: "scaleX" | "scaleY";
    first: { xPercent: number; yPercent: number };
    second: { xPercent: number; yPercent: number };
  };
  const desktop = getMotion(1280);
  const mobile = getMotion(600);

  assert.equal(desktop.impactScale, "scaleY");
  assert.ok(desktop.first.xPercent < 0 && desktop.second.xPercent > 0);
  assert.equal(mobile.impactScale, "scaleX");
  assert.ok(mobile.first.yPercent < 0 && mobile.second.yPercent > 0);
});

test("profile reveal restarts after returning above the section", () => {
  const getProfileRevealToggleActions = (motion as Record<string, unknown>).getProfileRevealToggleActions;
  assert.equal(typeof getProfileRevealToggleActions, "function");
  assert.equal((getProfileRevealToggleActions as () => string)(), "restart none none reset");
});
