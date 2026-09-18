import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { RESULTS_SECTIONS } from "@/components/results/sections";
import { EXILE_KEYS, PROTECTOR_KEYS } from "@/lib/scoring/types";

describe("results page invariants", () => {
  it("exile content never appears before protector content", () => {
    const i = (s: (typeof RESULTS_SECTIONS)[number]) => RESULTS_SECTIONS.indexOf(s);
    expect(i("protectorProfile")).toBeLessThan(i("exiles"));
    expect(i("protectorCards")).toBeLessThan(i("exiles"));
    expect(i("whoIsLeading")).toBeLessThan(i("exiles"));
  });
  it("the exercise targets the top protector, never an exile", () => {
    const view = readFileSync("components/results/ResultsView.tsx", "utf8");
    expect(view).toMatch(/topProtector = result\.protectors\.ranked\[0\]/);
    expect(view).toMatch(/<MeetThisPart protectorKey=\{topProtector\}/);
    expect(view).not.toMatch(/MeetThisPart[^\n]*exiles/);
    const meet = readFileSync("components/results/MeetThisPart.tsx", "utf8");
    expect(meet).toContain("PROTECTOR_KEYS as readonly string[]).includes(protectorKey)");
    for (const k of EXILE_KEYS) expect((PROTECTOR_KEYS as readonly string[]).includes(k)).toBe(false);
  });
});
