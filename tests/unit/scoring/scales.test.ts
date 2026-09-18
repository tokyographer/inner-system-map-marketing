import { describe, expect, it } from "vitest";
import { score } from "@/lib/scoring";
import { itemsForForm, ITEMS } from "@/content/items.v2";
import { ALL_SCALE_KEYS } from "@/lib/scoring/types";
import { partBand, selfBand, toDisplay } from "@/lib/scoring/scales";
import { build } from "./helpers";

describe("item bank", () => {
  it("has 84 items, 63 short-form, 8 SELF (6 short), 4 per other scale (3 short)", () => {
    expect(ITEMS).toHaveLength(84);
    expect(itemsForForm("short")).toHaveLength(63);
    for (const key of ALL_SCALE_KEYS) {
      const own = ITEMS.filter((i) => i.scale === key);
      const short = own.filter((i) => i.short);
      if (key === "SELF") { expect(own).toHaveLength(8); expect(short).toHaveLength(6); }
      else { expect(own).toHaveLength(4); expect(short).toHaveLength(3); }
    }
  });
  it("has unique stable ids", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
  });
  it("contains no self-harm or suicidality wording", () => {
    const text = ITEMS.map((i) => i.text.toLowerCase()).join(" ");
    for (const w of ["suicid", "kill myself", "hurt myself", "self-harm", "end my life"]) expect(text).not.toContain(w);
  });
});

describe("scale scores and bands", () => {
  it("mean and display map 1→0, 3→50, 5→100", () => {
    expect(toDisplay(1)).toBe(0);
    expect(toDisplay(3)).toBe(50);
    expect(toDisplay(5)).toBe(100);
  });
  it("part bands at boundaries", () => {
    expect(partBand(2.49)).toBe("quiet");
    expect(partBand(2.5)).toBe("present");
    expect(partBand(3.49)).toBe("present");
    expect(partBand(3.5)).toBe("veryActive");
  });
  it("self bands at boundaries", () => {
    expect(selfBand(2.49)).toBe("hardToReach");
    expect(selfBand(2.5)).toBe("availableAtTimes");
    expect(selfBand(3.5)).toBe("oftenAvailable");
  });
  it("computes per-scale means from raw items (full form)", () => {
    const r = score({ form: "full", responses: build("full", { PERF: [5, 3, 4, 4] }) });
    expect(r.scales.PERF.mean).toBe(4);
    expect(r.scales.PERF.display).toBe(75);
    expect(r.scales.PERF.highCount).toBe(3);
    expect(r.scales.PERF.itemCount).toBe(4);
  });
  it("short form scores only asterisk items", () => {
    const r = score({ form: "short", responses: build("short", { SELF: 4 }) });
    expect(r.self.itemCount).toBe(6);
    expect(r.scales.PERF.itemCount).toBe(3);
    expect(r.form).toBe("short");
  });
  it("throws on incomplete responses", () => {
    const responses = build("full", {});
    delete responses.SELF1;
    expect(() => score({ form: "full", responses })).toThrow(/Incomplete/);
  });
  it("full form requires the non-short items too", () => {
    expect(() => score({ form: "full", responses: build("short", {}) })).toThrow(/Incomplete/);
  });
});
