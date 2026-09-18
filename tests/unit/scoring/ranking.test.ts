import { describe, expect, it } from "vitest";
import { score } from "@/lib/scoring";
import { build } from "./helpers";

describe("protector ranking", () => {
  it("ranks 14 protectors and 5 exiles separately", () => {
    const r = score({ form: "full", responses: build("full", { SHAM: 5, PERF: 4 }) });
    expect(r.protectors.ranked).toHaveLength(14);
    expect(r.exiles.ranked).toHaveLength(5);
    expect(r.protectors.ranked[0]).toBe("PERF");
    expect(r.exiles.ranked[0]).toBe("SHAM");
    expect(r.protectors.ranked).not.toContain("SHAM");
  });
  it("leading protector: ≥ 3.0 and ≥ 0.4 above second", () => {
    const r = score({ form: "full", responses: build("full", { PERF: [4, 4, 4, 4], CRIT: [4, 4, 3, 3] }) });
    expect(r.scales.PERF.mean).toBe(4);
    expect(r.scales.CRIT.mean).toBe(3.5);
    expect(r.protectors.leading).toBe("PERF");
    expect(r.protectors.team).toEqual([]);
  });
  it("gap exactly 0.4 still counts as leading (boundary)", () => {
    // PERF 3.0 (3,3,3,3) vs CRIT 2.5 (3,3,2,2) → gap 0.5; use 3.25 vs 2.75 for 0.5; exact 0.4 not reachable with 4 items, so test 0.5 and 0.25
    const r = score({ form: "full", responses: build("full", { PERF: [3, 3, 3, 3], CRIT: [3, 3, 2, 2] }) });
    expect(r.protectors.leading).toBe("PERF");
    const r2 = score({ form: "full", responses: build("full", { PERF: [3, 3, 3, 3], CRIT: [3, 3, 3, 2] }) });
    expect(r2.protectors.leading).toBeNull();
  });
  it("top below 3.0 is never leading", () => {
    const r = score({ form: "full", responses: build("full", { PERF: [3, 3, 3, 2] }) });
    expect(r.scales.PERF.mean).toBe(2.75);
    expect(r.protectors.leading).toBeNull();
    expect(r.protectors.team[0]).toBe("PERF");
  });
  it("team of two when third is far behind", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 4, CRIT: 4 }, 1) });
    expect(r.protectors.leading).toBeNull();
    expect(r.protectors.team).toEqual(["CRIT", "PERF"]);
  });
  it("team of three when third is within 0.4 of second", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 4, CRIT: 4, PLEA: [4, 4, 4, 3] }, 1) });
    expect(r.protectors.team).toEqual(["CRIT", "PERF", "PLEA"]);
  });
  it("ties break by count of 4/5 answers, then alphabetically", () => {
    // Same mean 3.0: CRIT has one 5 (highCount 1), PERF none.
    const r = score({ form: "full", responses: build("full", { PERF: [3, 3, 3, 3], CRIT: [5, 3, 2, 2], AVOI: [3, 3, 3, 3] }, 1) });
    expect(r.protectors.ranked.slice(0, 3)).toEqual(["CRIT", "AVOI", "PERF"]);
  });
});

describe("pairings", () => {
  it("shown only for top-3 protectors with linked exile ≥ 2.5", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 5, CTRL: 4, PLEA: 4, SHAM: [3, 2, 2, 3], FEAR: 1, ABAN: 1 }, 1) });
    expect(r.scales.SHAM.mean).toBe(2.5);
    expect(r.pairings).toEqual([{ protector: "PERF", exile: "SHAM" }]);
  });
  it("no pairing when exile is 2.49 or lower", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 5, SHAM: [3, 2, 2, 2] }, 1) });
    expect(r.pairings).toEqual([]);
  });
  it("no pairing for a protector outside the top 3", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 5, CTRL: 5, PLEA: 5, HYPV: 2, FEAR: 5 }, 1) });
    expect(r.pairings.find((p) => p.protector === "HYPV")).toBeUndefined();
    expect(r.pairings).toContainEqual({ protector: "CTRL", exile: "FEAR" });
  });
});
