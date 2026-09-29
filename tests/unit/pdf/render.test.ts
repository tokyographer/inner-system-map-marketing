import { describe, expect, it } from "vitest";
import { score } from "@/lib/scoring";
import { renderResultsPdf } from "@/lib/pdf/render";
import { build } from "../scoring/helpers";

describe("results PDF", () => {
  it("renders a PDF for a MANAGED result", async () => {
    const result = score({ form: "short", responses: build("short", { PERF: 5, CRIT: 4, SHAM: 3 }, 2) });
    const pdf = await renderResultsPdf({ result, locale: "en", mode: "public", now: new Date("2026-09-18") });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(5000);
  });
  it("renders Turkish and Romanian with embedded glyphs", async () => {
    const result = score({ form: "short", responses: build("short", { PERF: 5 }, 2) });
    for (const locale of ["tr", "ro"] as const) {
      const pdf = await renderResultsPdf({ result, locale, mode: "public" });
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
      expect(pdf.toString("latin1")).toContain("Jost");
    }
  });
  it("renders a PDF for FLOODED and for HIDDEN_EXILES", async () => {
    const flooded = score({ form: "full", responses: build("full", { SHAM: 4, LONE: 4 }, 2) });
    const hidden = score({ form: "full", responses: build("full", { PERF: 4, CTRL: 4 }, 1) });
    for (const result of [flooded, hidden]) {
      const pdf = await renderResultsPdf({ result, locale: "en", mode: "cohort" });
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    }
  });
});
