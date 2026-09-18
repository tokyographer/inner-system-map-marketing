import { describe, expect, it } from "vitest";
import { score } from "@/lib/scoring";
import { build } from "./helpers";

describe("response-quality flags", () => {
  it("STRAIGHT_LINING at 90% same answer", () => {
    const all3 = build("full", {}, 3);
    expect(score({ form: "full", responses: all3 }).qualityFlags).toContain("STRAIGHT_LINING");
    // 84 items: 75/84 = 89.3% → no flag; 76/84 = 90.5% → flag
    const ids = Object.keys(all3);
    const r75 = { ...all3 }; ids.slice(0, 9).forEach((id) => (r75[id] = 2));
    expect(score({ form: "full", responses: r75 }).qualityFlags).not.toContain("STRAIGHT_LINING");
    const r76 = { ...all3 }; ids.slice(0, 8).forEach((id) => (r76[id] = 2));
    expect(score({ form: "full", responses: r76 }).qualityFlags).toContain("STRAIGHT_LINING");
  });
  it("TOO_FAST under 4 min full, 3 min short; absent when duration unknown", () => {
    const full = build("full", { PERF: 3 }, 2);
    expect(score({ form: "full", responses: full, durationSeconds: 239 }).qualityFlags).toContain("TOO_FAST");
    expect(score({ form: "full", responses: full, durationSeconds: 240 }).qualityFlags).not.toContain("TOO_FAST");
    const short = build("short", { PERF: 3 }, 2);
    expect(score({ form: "short", responses: short, durationSeconds: 179 }).qualityFlags).toContain("TOO_FAST");
    expect(score({ form: "short", responses: short, durationSeconds: 180 }).qualityFlags).not.toContain("TOO_FAST");
    expect(score({ form: "short", responses: short }).qualityFlags).not.toContain("TOO_FAST");
  });
  it("ACQUIESCENCE when SELF ≥ 4 and protectionLoad ≥ 4", () => {
    const r = score({ form: "full", responses: build("full", { SELF: 4, SHAM: 1 }, 4) });
    expect(r.qualityFlags).toContain("ACQUIESCENCE");
    const r2 = score({ form: "full", responses: build("full", { SELF: [4, 4, 4, 4, 4, 4, 4, 3], SHAM: 1 }, 4) });
    expect(r2.qualityFlags).not.toContain("ACQUIESCENCE");
  });
});
