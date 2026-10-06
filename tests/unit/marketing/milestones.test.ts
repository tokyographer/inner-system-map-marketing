import { describe, expect, it } from "vitest";
import { crossesHalfway, MILESTONE_SPAN, milestoneAt } from "@/marketing/milestones";

describe("milestoneAt", () => {
  it("shows the third message on statements 22–24 of 63 and the two-thirds message on 43–45", () => {
    const shown = Array.from({ length: 63 }, (_, i) => milestoneAt(i, 63));
    expect(shown.flatMap((m, i) => (m ? [[i + 1, m]] : []))).toEqual([
      [22, "third"], [23, "third"], [24, "third"], [43, "twoThirds"], [44, "twoThirds"], [45, "twoThirds"],
    ]);
  });

  it("scales with the form length, and shows nothing on very short forms", () => {
    expect(milestoneAt(28, 84)).toBe("third");
    expect(milestoneAt(56, 84)).toBe("twoThirds");
    expect(milestoneAt(3, 3 * MILESTONE_SPAN - 1)).toBeNull();
  });
});

describe("crossesHalfway", () => {
  it("fires once when moving forward into the middle statement, never backwards", () => {
    expect(crossesHalfway(30, 31, 63)).toBe(true);
    expect(crossesHalfway(31, 32, 63)).toBe(false);
    expect(crossesHalfway(32, 31, 63)).toBe(false);
    expect(crossesHalfway(29, 30, 63)).toBe(false);
  });
});
