import { describe, it, expect } from "vitest";
import { crc32, formatBytes, buildZip, findQualityForTarget } from "../lib/compress";

describe("crc32", () => {
  it("matches the standard test vector", () => {
    const bytes = new TextEncoder().encode("123456789");
    expect(crc32(bytes)).toBe(0xcbf43926);
  });

  it("returns 0 for empty input", () => {
    expect(crc32(new Uint8Array())).toBe(0);
  });
});

describe("formatBytes", () => {
  it("formats bytes with human units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });
});

describe("buildZip", () => {
  const file = {
    name: "a.txt",
    data: new TextEncoder().encode("hello"),
  };

  it("produces a valid zip structure", async () => {
    const zip = await buildZip([file]);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    const ascii = (s: string) => Array.from(s, (c) => c.charCodeAt(0));
    expect(Array.from(bytes.subarray(0, 4))).toEqual(ascii("PK\x03\x04"));
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("PK\x05\x06");
    expect(text).toContain("PK\x01\x02");
    expect(text).toContain("a.txt");
    expect(text).toContain("hello");
  });

  it("stores per-entry crc32", async () => {
    const zip = await buildZip([file]);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const crcAt = 14;
    expect(view.getUint32(crcAt, true)).toBe(crc32(file.data));
  });
});

describe("findQualityForTarget", () => {
  it("returns a quality whose encoded size fits the target", async () => {
    const measure = async (quality: number) => Math.round(quality * 1000);
    const quality = await findQualityForTarget(measure, 500);
    expect(quality).toBeLessThanOrEqual(0.5);
    expect(await measure(quality)).toBeLessThanOrEqual(500);
  });

  it("returns the floor quality when nothing fits", async () => {
    const measure = async (quality: number) => Math.round(quality * 1000) + 100000;
    const quality = await findQualityForTarget(measure, 500);
    expect(quality).toBe(0.1);
  });

  it("returns the max quality when the target is easy", async () => {
    const measure = async () => 10;
    const quality = await findQualityForTarget(measure, 5000);
    expect(quality).toBe(1);
  });
});
