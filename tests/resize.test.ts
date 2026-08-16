import { describe, expect, it } from "vitest";
import { computeFit, makeSeoFilename } from "../lib/resize";

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
