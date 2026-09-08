export type GlassRainDrop = {
  pane: 0 | 1 | 2 | 3;
  kind: "bead" | "trail";
  x: number;
  y: number;
  size: number;
  length: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

const sample = (index: number, offset: number) => {
  const value = Math.sin((index + 1) * (12.9898 + offset * 7.233)) * 43758.5453;
  return value - Math.floor(value);
};

const round = (value: number, precision = 2) => Number(value.toFixed(precision));

export function getGlassRainDensity(viewportWidth: number) {
  return viewportWidth <= 900 ? 28 : 48;
}

export function createGlassRainDrops(count: number): GlassRainDrop[] {
  return Array.from({ length: count }, (_, index) => ({
    pane: (index % 4) as GlassRainDrop["pane"],
    kind: index % 3 === 0 ? "trail" : "bead",
    x: round(6 + sample(index, 1) * 88),
    y: round(-18 + sample(index, 2) * 100),
    size: round(1.8 + sample(index, 3) * 4.1),
    length: round(24 + sample(index, 4) * 58),
    duration: round(4.4 + sample(index, 5) * 4.4),
    delay: round(-sample(index, 6) * 9),
    drift: round(-4 + sample(index, 7) * 8),
    opacity: round(0.28 + sample(index, 8) * 0.44),
  }));
}
