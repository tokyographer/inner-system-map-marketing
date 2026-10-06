import { describe, expect, it } from "vitest";
import { resultsPdfFilename, slugify } from "@/lib/pdf/filename";

describe("results PDF filename", () => {
  it("puts the person's name after the app name in the given locale", () => {
    expect(resultsPdfFilename("en", "Ana García")).toBe("inner-system-map-results-ana-garcia.pdf");
    expect(resultsPdfFilename("es", "Ana García")).toBe("mapa-del-sistema-interno-results-ana-garcia.pdf");
    expect(resultsPdfFilename("ro", "Ștefan Ionuț")).toBe("harta-sistemului-interior-results-stefan-ionut.pdf");
    expect(resultsPdfFilename("tr", "Şule Yıldız")).toBe("ic-sistem-haritasi-results-sule-yildiz.pdf");
  });
  it("falls back to no name when none is given or nothing is left after slugging", () => {
    expect(resultsPdfFilename("en")).toBe("inner-system-map-results.pdf");
    expect(resultsPdfFilename("en", "   ")).toBe("inner-system-map-results.pdf");
    expect(resultsPdfFilename("en", "Анна")).toBe("inner-system-map-results.pdf");
  });
  it("is ASCII only and bounded, so it is safe in headers and attachments", () => {
    const f = resultsPdfFilename("en", `Zoë "O'Brien" <x@y.z>; rm -rf / ${"a".repeat(200)}`);
    expect(f).toMatch(/^[a-z0-9-]+\.pdf$/);
    expect(slugify("x".repeat(200))).toHaveLength(40);
    expect(slugify("Jürgen Groß-Øster ")).toBe("jurgen-gross-oster");
  });
});
