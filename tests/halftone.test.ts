import { describe, expect, it } from "vitest";
import { luminanceToDots, type PixelGrid } from "../lib/halftone";

function gridOf(width: number, height: number, luminance: number): PixelGrid {
  const data = new Uint8ClampedArray(width * height * 4);
  const v = Math.round(luminance * 255);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  return { width, height, data };
}

const OPTS = { dotSize: 8, spacing: 8, angleDeg: 0, shape: "round", sensitivity: 0.5 } as const;

describe("luminanceToDots", () => {
  it("produces large dots for dark regions", () => {
    const black = luminanceToDots(gridOf(100, 100, 0), { ...OPTS });
    expect(black.length).toBeGreaterThan(0);
    expect(Math.max(...black.map((d) => d.radius))).toBe(4);
    expect(black.every((d) => d.shape === "round")).toBe(true);
  });

  it("produces no dots for pure white", () => {
    const white = luminanceToDots(gridOf(100, 100, 1), { ...OPTS });
    expect(white.length).toBe(0);
  });

  it("thresholds out light areas with low sensitivity", () => {
    const mid = luminanceToDots(gridOf(100, 100, 0.9), { ...OPTS, sensitivity: 0.2 });
    expect(mid.length).toBe(0);
  });
});
