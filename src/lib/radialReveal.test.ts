import assert from "node:assert/strict";
import test from "node:test";

import { getRadialRevealMetrics } from "./radialReveal.ts";

test("anchors the radial reveal at the pointer and covers the furthest corner", () => {
  const metrics = getRadialRevealMetrics(
    { left: 100, top: 200, width: 200, height: 100 },
    { clientX: 150, clientY: 225 },
  );

  assert.equal(metrics.x, 25);
  assert.equal(metrics.y, 25);
  assert.ok(metrics.maxRadiusPercent > 100);
});

test("clamps the reveal origin to the button bounds", () => {
  const metrics = getRadialRevealMetrics(
    { left: 100, top: 200, width: 200, height: 100 },
    { clientX: 50, clientY: 400 },
  );

  assert.equal(metrics.x, 0);
  assert.equal(metrics.y, 100);
});
