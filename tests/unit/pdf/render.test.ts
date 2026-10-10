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
  it("includes the Meet this part reflection for the leading protector, after the exiles section", async () => {
    const result = score({ form: "short", responses: build("short", { PERF: 5, SHAM: 3 }, 2) });
    const pdf = await renderResultsPdf({ result, locale: "en", mode: "public" });
    const text = pdf.toString("latin1");
    expect(result.protectors.ranked[0]).toBe("PERF");
    expect(text.length).toBeGreaterThan(20000);
  });
  it("renders a PDF for FLOODED and for HIDDEN_EXILES", async () => {
    const flooded = score({ form: "full", responses: build("full", { SHAM: 4, LONE: 4 }, 2) });
    const hidden = score({ form: "full", responses: build("full", { PERF: 4, CTRL: 4 }, 1) });
    for (const result of [flooded, hidden]) {
      const pdf = await renderResultsPdf({ result, locale: "en", mode: "cohort" });
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    }
  });
  it("prints the WhatsApp booking link on public results, never on FLOODED or cohort PDFs", async () => {
    const link = "wa.me/34613714789";
    const MANAGERS = { PERF: 4, CRIT: 4, PLEA: 4, CTRL: 4, INTL: 4, AVOI: 4, CARE: 4, HYPV: 4, DIST: 4 } as const;
    const EXILES = { SHAM: 5, ABAN: 5, FEAR: 5, POWL: 5, LONE: 5 } as const;
    const full = (per: Parameters<typeof build>[1], fb: Parameters<typeof build>[2]) => score({ form: "full", responses: build("full", per, fb) });
    const managed = (await renderResultsPdf({ result: full({ SELF: 2, ...MANAGERS }, 1), locale: "es", mode: "public", name: "Ana" })).toString("latin1");
    expect(managed.split(link).length - 1).toBe(2);
    const cohort = (await renderResultsPdf({ result: full({ SELF: 2, ...MANAGERS }, 1), locale: "es", mode: "cohort" })).toString("latin1");
    expect(cohort).not.toContain(link);
    const flooded = (await renderResultsPdf({ result: full({ SELF: 2, ...EXILES }, 3), locale: "es", mode: "public", name: "Ana" })).toString("latin1");
    expect(flooded).not.toContain(link);
  });
});
