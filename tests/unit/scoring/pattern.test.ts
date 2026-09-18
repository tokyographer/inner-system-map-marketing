import { describe, expect, it } from "vitest";
import { score } from "@/lib/scoring";
import { patternKey, modifiers } from "@/lib/scoring/pattern";
import { build } from "./helpers";

const L = (manager: number, firefighter: number, exile: number) => ({ manager, firefighter, exile, protectionLoad: 0 });

describe("group lead scores", () => {
  it("uses the mean of the two highest scales per group and excludes REBL", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 5, CRIT: 3, NUMB: 4, DISS: 2, SHAM: 5, LONE: 3, REBL: 5 }) });
    expect(r.leads.manager).toBe(4);
    expect(r.leads.firefighter).toBe(3);
    expect(r.leads.exile).toBe(4);
  });
  it("protectionLoad is the mean of all 14 protector scales including REBL", () => {
    const r = score({ form: "full", responses: build("full", { REBL: 5 }) });
    expect(r.leads.protectionLoad).toBeCloseTo((13 * 1 + 5) / 14, 4);
  });
});

describe("system pattern, evaluated in order", () => {
  it("SELF_LED: SELF ≥ 3.5 and all leads < 3.0", () => {
    expect(patternKey(3.5, L(2.99, 2.99, 2.99))).toBe("SELF_LED");
    expect(patternKey(3.49, L(2, 2, 2))).not.toBe("SELF_LED");
    expect(patternKey(3.5, L(3.0, 2, 2))).not.toBe("SELF_LED");
  });
  it("FLOODED: exile ≥ 3.5 and ≥ both protector leads − 0.3", () => {
    expect(patternKey(1, L(3.8, 3.8, 3.5))).toBe("FLOODED");
    expect(patternKey(1, L(3.81, 2, 3.5))).not.toBe("FLOODED");
    expect(patternKey(1, L(2, 2, 3.49))).not.toBe("FLOODED");
  });
  it("FLOODED wins over SELF_LED check only when SELF_LED fails", () => {
    expect(patternKey(4, L(2, 2, 3.5))).toBe("FLOODED");
  });
  it("REACTIVE: firefighter ≥ 3.0 and ≥ manager + 0.3", () => {
    expect(patternKey(1, L(2.7, 3.0, 1))).toBe("REACTIVE");
    expect(patternKey(1, L(2.71, 3.0, 1))).not.toBe("REACTIVE");
    expect(patternKey(1, L(1, 2.99, 1))).not.toBe("REACTIVE");
  });
  it("MANAGED: manager ≥ 3.0 and ≥ firefighter + 0.3", () => {
    expect(patternKey(1, L(3.0, 2.7, 1))).toBe("MANAGED");
    expect(patternKey(1, L(3.0, 2.71, 1))).not.toBe("MANAGED");
  });
  it("POLARISED: both ≥ 3.0 and within 0.3", () => {
    expect(patternKey(1, L(3.0, 3.0, 1))).toBe("POLARISED");
    expect(patternKey(1, L(3.2, 3.0, 1))).toBe("POLARISED");
    expect(patternKey(1, L(3.5, 3.3, 1))).toBe("POLARISED");
    // a gap of exactly 0.3 satisfies rule 4 first, so MANAGED wins by evaluation order
    expect(patternKey(1, L(3.6, 3.3, 1))).toBe("MANAGED");
    expect(patternKey(1, L(3.2, 2.9, 1))).not.toBe("POLARISED");
  });
  it("QUIET_OR_GUARDED: none of the above", () => {
    expect(patternKey(3.4, L(2, 2, 2))).toBe("QUIET_OR_GUARDED");
    expect(patternKey(1, L(2.9, 2.9, 1))).toBe("QUIET_OR_GUARDED");
    expect(patternKey(1, L(3.2, 2.95, 1))).toBe("QUIET_OR_GUARDED");
  });
});

describe("modifiers", () => {
  it("HIDDEN_EXILES on MANAGED/REACTIVE/POLARISED when exile < 2.5", () => {
    expect(modifiers("MANAGED", 1, L(4, 1, 2.49))).toContain("HIDDEN_EXILES");
    expect(modifiers("REACTIVE", 1, L(1, 4, 2.49))).toContain("HIDDEN_EXILES");
    expect(modifiers("POLARISED", 1, L(4, 4, 2.49))).toContain("HIDDEN_EXILES");
    expect(modifiers("MANAGED", 1, L(4, 1, 2.5))).not.toContain("HIDDEN_EXILES");
    expect(modifiers("QUIET_OR_GUARDED", 1, L(1, 1, 1))).not.toContain("HIDDEN_EXILES");
    expect(modifiers("SELF_LED", 4, L(1, 1, 1))).not.toContain("HIDDEN_EXILES");
  });
  it("SELF_PRESENT when not SELF_LED and SELF ≥ 3.5", () => {
    expect(modifiers("MANAGED", 3.5, L(4, 1, 3))).toContain("SELF_PRESENT");
    expect(modifiers("MANAGED", 3.49, L(4, 1, 3))).not.toContain("SELF_PRESENT");
    expect(modifiers("SELF_LED", 4, L(1, 1, 1))).not.toContain("SELF_PRESENT");
  });
  it("both modifiers can apply together", () => {
    expect(modifiers("MANAGED", 4, L(4, 1, 1))).toEqual(["HIDDEN_EXILES", "SELF_PRESENT"]);
  });
});

describe("end-to-end patterns from raw responses", () => {
  it("SELF_LED", () => {
    const r = score({ form: "short", responses: build("short", { SELF: 5 }, 2) });
    expect(r.pattern.key).toBe("SELF_LED");
    expect(r.pattern.modifiers).toEqual([]);
    expect(r.careFlag).toBe(false);
  });
  it("FLOODED sets careFlag", () => {
    const r = score({ form: "full", responses: build("full", { SHAM: 4, LONE: 4 }, 2) });
    expect(r.pattern.key).toBe("FLOODED");
    expect(r.careFlag).toBe(true);
  });
  it("careFlag from exileLead ≥ 4.0 even when protectors lead", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 5, CRIT: 5, SHAM: 4, LONE: 4 }, 1) });
    expect(r.pattern.key).toBe("MANAGED");
    expect(r.careFlag).toBe(true);
  });
  it("MANAGED with HIDDEN_EXILES", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 4, CTRL: 4 }, 1) });
    expect(r.pattern.key).toBe("MANAGED");
    expect(r.pattern.modifiers).toContain("HIDDEN_EXILES");
  });
  it("REACTIVE with SELF_PRESENT", () => {
    const r = score({ form: "full", responses: build("full", { SELF: 4, NUMB: 4, ANGR: 4, SHAM: 3, LONE: 3 }, 1) });
    expect(r.pattern.key).toBe("REACTIVE");
    expect(r.pattern.modifiers).toContain("SELF_PRESENT");
    expect(r.pattern.modifiers).not.toContain("HIDDEN_EXILES");
  });
  it("POLARISED", () => {
    const r = score({ form: "full", responses: build("full", { PERF: 4, CTRL: 4, NUMB: 4, ANGR: 4 }, 1) });
    expect(r.pattern.key).toBe("POLARISED");
  });
  it("QUIET_OR_GUARDED", () => {
    const r = score({ form: "full", responses: build("full", {}, 2) });
    expect(r.pattern.key).toBe("QUIET_OR_GUARDED");
  });
});
