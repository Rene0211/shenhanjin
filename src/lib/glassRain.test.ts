import assert from "node:assert/strict";
import test from "node:test";

test("creates balanced deterministic rain for all four train windows", async () => {
  const rain = await import("./glassRain.ts").catch(() => ({}));
  const createGlassRainDrops = (rain as Record<string, unknown>).createGlassRainDrops;

  assert.equal(typeof createGlassRainDrops, "function");

  const createDrops = createGlassRainDrops as (count: number) => Array<{
    pane: number;
    kind: "bead" | "trail";
    x: number;
    y: number;
  }>;
  const drops = createDrops(32);

  assert.deepEqual(drops, createDrops(32));
  assert.equal(drops.length, 32);
  assert.deepEqual(
    [0, 1, 2, 3].map((pane) => drops.filter((drop) => drop.pane === pane).length),
    [8, 8, 8, 8],
  );
  assert.ok(drops.some((drop) => drop.kind === "bead"));
  assert.ok(drops.some((drop) => drop.kind === "trail"));
  assert.ok(drops.every((drop) => drop.x >= 6 && drop.x <= 94));
  assert.ok(drops.every((drop) => drop.y >= -18 && drop.y <= 82));
});

test("uses a denser desktop shower and a lighter mobile shower", async () => {
  const rain = await import("./glassRain.ts");
  const getGlassRainDensity = (rain as Record<string, unknown>).getGlassRainDensity;

  assert.equal(typeof getGlassRainDensity, "function");
  assert.equal((getGlassRainDensity as (viewportWidth: number) => number)(1280), 48);
  assert.equal((getGlassRainDensity as (viewportWidth: number) => number)(390), 28);
});
