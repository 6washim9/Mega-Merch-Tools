import { describe, expect, it } from "vitest";
import { DPI_300_PPM, injectPhyS } from "../lib/dpi";

function minimalPng(): Uint8Array {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const ihdr = [0, 0, 0, 13, 73, 72, 68, 82];
  const ihdrData = new Array<number>(13).fill(0);
  const crc = [0, 0, 0, 0];
  return new Uint8Array([...signature, ...ihdr, ...ihdrData, ...crc]);
}

describe("injectPhyS", () => {
  it("inserts a pHYs chunk with 300 DPI right after IHDR", () => {
    const png = minimalPng();
    const out = injectPhyS(png, DPI_300_PPM, DPI_300_PPM);
    expect(out.length).toBe(png.length + 21);
    expect(Array.from(out.slice(33, 37))).toEqual([0, 0, 0, 9]);
    expect(Array.from(out.slice(37, 41))).toEqual([0x70, 0x48, 0x59, 0x73]);
    const dv = new DataView(out.buffer, 41, 8);
    expect(dv.getUint32(0, false)).toBe(DPI_300_PPM);
    expect(dv.getUint32(4, false)).toBe(DPI_300_PPM);
    expect(out[49]).toBe(1);
  });

  it("preserves the original IHDR chunk bytes", () => {
    const png = minimalPng();
    const out = injectPhyS(png, DPI_300_PPM, DPI_300_PPM);
    expect(Array.from(out.slice(0, 33))).toEqual(Array.from(png));
  });
});
