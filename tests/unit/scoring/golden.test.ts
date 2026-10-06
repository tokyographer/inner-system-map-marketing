import { describe, expect, it } from "vitest";
import { SCORING_VERSION } from "@/config/scoring";
import { ITEM_BANK_VERSION } from "@/content/items.v2";
import { score, type Responses } from "@/lib/scoring";
import golden from "@/tests/fixtures/core-golden.json";

// Shared with the marketing repo (see CORE.md). A failure means the scoring core differs
// from the fixture: port the upstream change, or, for a deliberate upstream change, run
// `npm run core:golden:update` and port the new fixture with it.
describe("core golden results", () => {
  it("fixture matches the current scoring and item bank versions", () => {
    expect(golden.scoringVersion).toBe(SCORING_VERSION);
    expect(golden.itemBankVersion).toBe(ITEM_BANK_VERSION);
  });

  it("covers every pattern", () => {
    const patterns = new Set(golden.cases.map((c) => c.result.pattern.key));
    expect([...patterns].sort()).toEqual(["FLOODED", "MANAGED", "POLARISED", "QUIET_OR_GUARDED", "REACTIVE", "SELF_LED"]);
  });

  it.each(golden.cases.map((c) => [c.name, c] as const))("%s", (_name, c) => {
    const { form, durationSeconds, responses } = c.input;
    expect(score({ form: form as "full" | "short", durationSeconds, responses: responses as Responses })).toEqual(c.result);
  });
});
