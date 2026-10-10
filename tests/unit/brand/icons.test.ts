import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";

describe("app icons (regenerate with node scripts/build-favicons.mjs)", () => {
  it("icon.svg is the Transcendent Institute mark in brand gold", () => {
    const svg = readFileSync("app/icon.svg", "utf8");
    expect(svg).toContain('fill="#DDAA11"');
    expect(svg).toContain('fill-rule="evenodd"');
    expect(svg).toContain('viewBox="0 0 100 100"');
  });
  it("favicon.ico holds 16, 32 and 48 px PNG images", () => {
    const ico = readFileSync("app/favicon.ico");
    expect(ico.readUInt16LE(2)).toBe(1);
    const count = ico.readUInt16LE(4);
    expect(count).toBe(3);
    const sizes = Array.from({ length: count }, (_, i) => ico.readUInt8(6 + i * 16));
    expect(sizes).toEqual([16, 32, 48]);
    const first = ico.readUInt32LE(6 + 12);
    expect(ico.subarray(first, first + 4).toString("hex")).toBe("89504e47");
  });
  it("apple-icon.png is 180 px and opaque, because iOS fills transparency with black", async () => {
    const meta = await sharp("app/apple-icon.png").metadata();
    expect([meta.width, meta.height]).toEqual([180, 180]);
    const { data } = await sharp("app/apple-icon.png").raw().toBuffer({ resolveWithObject: true });
    expect(data[3]).toBe(255);
  });
});
