import { describe, expect, it } from "vitest";
import { computeFit, computePlacement, makeSeoFilename } from "../lib/resize";

describe("computeFit", () => {
  it("contain centers the image inside the target preserving aspect", () => {
    const fit = computeFit(1000, 500, 100, 100, "contain");
    expect(fit).toEqual({ sx: 0, sy: 0, sw: 1000, sh: 500, dx: 0, dy: 25, dw: 100, dh: 50 });
  });

  it("cover crops the source to fill the target", () => {
    const fit = computeFit(1000, 500, 100, 100, "cover");
    expect(fit.dw).toBe(100);
    expect(fit.dh).toBe(100);
    expect(fit.sx).toBe(250);
    expect(fit.sy).toBe(0);
    expect(fit.sw).toBe(500);
    expect(fit.sh).toBe(500);
  });

  it("stretch maps the full source to the full target", () => {
    const fit = computeFit(1000, 500, 100, 200, "stretch");
    expect(fit).toEqual({ sx: 0, sy: 0, sw: 1000, sh: 500, dx: 0, dy: 0, dw: 100, dh: 200 });
  });
});

describe("makeSeoFilename", () => {
  it("strips extension, sanitizes, and appends target size", () => {
    expect(makeSeoFilename("My  Design!.PNG", 4500, 5400)).toBe("my-design-4500x5400.png");
  });
});

describe("computePlacement", () => {
  it("does not upscale in cover mode when upscale is false", () => {
    const placement = computePlacement(1000, 500, 800, 800, "cover", false);
    expect(placement.dw).toBe(1000);
    expect(placement.dh).toBe(500);
    expect(placement.dx).toBe(-100);
    expect(placement.dy).toBe(150);
  });

  it("still covers when upscaling is allowed", () => {
    const placement = computePlacement(1000, 500, 800, 800, "cover", true);
    expect(placement.dw).toBe(800);
    expect(placement.dh).toBe(800);
  });

  it("does not upscale in contain mode when upscale is false", () => {
    const placement = computePlacement(500, 500, 1000, 1000, "contain", false);
    expect(placement.dw).toBe(500);
    expect(placement.dh).toBe(500);
  });
});
