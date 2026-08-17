import { describe, it, expect } from "vitest";
import { OUTPUT_FORMATS, findFormatByMime } from "../lib/convert";

describe("findFormatByMime", () => {
  it("finds a known format by mime", () => {
    expect(findFormatByMime("image/webp")?.ext).toBe("webp");
    expect(findFormatByMime("image/jpeg")?.ext).toBe("jpg");
  });

  it("returns undefined for unknown mime", () => {
    expect(findFormatByMime("image/gif")).toBeUndefined();
  });

  it("exposes unique extensions", () => {
    const exts = OUTPUT_FORMATS.map((f) => f.ext);
    expect(new Set(exts).size).toBe(exts.length);
  });
});
