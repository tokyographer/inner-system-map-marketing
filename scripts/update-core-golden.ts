/**
 * Regenerates tests/fixtures/core-golden.json: fixed inputs and the exact
 * score() output for each. The fixture is core (see CORE.md) and is shared
 * with the marketing repo, so regenerate it only for a deliberate scoring or
 * item-bank change made upstream. Run: npm run core:golden:update
 */
import { writeFileSync } from "node:fs";
import { SCORING_VERSION } from "../config/scoring";
import { ITEM_BANK_VERSION } from "../content/items.v2";
import { score, type Response, type ScaleKey } from "../lib/scoring";
import { build } from "../tests/unit/scoring/helpers";

type PerScale = Partial<Record<ScaleKey, Response | Response[]>>;
interface Case { name: string; form: "full" | "short"; perScale: PerScale; fallback?: Response; durationSeconds?: number }

const MANAGERS_HIGH: PerScale = { PERF: 4, CRIT: 4, PLEA: 4, CTRL: 4, INTL: 4, AVOI: 4, CARE: 4, HYPV: 4, DIST: 4 };
const FIREFIGHTERS_HIGH: PerScale = { NUMB: 4, DISS: 4, ANGR: 4, IMPL: 4 };
const EXILES_HIGH: PerScale = { SHAM: 5, ABAN: 5, FEAR: 5, POWL: 5, LONE: 5 };

const CASES: Case[] = [
  { name: "self-led, full", form: "full", perScale: { SELF: 5 }, fallback: 1, durationSeconds: 600 },
  { name: "self-led, short", form: "short", perScale: { SELF: 5 }, fallback: 1, durationSeconds: 600 },
  { name: "flooded", form: "full", perScale: { SELF: 2, ...EXILES_HIGH }, fallback: 3, durationSeconds: 600 },
  { name: "reactive", form: "full", perScale: { SELF: 2, ...FIREFIGHTERS_HIGH }, fallback: 2, durationSeconds: 600 },
  { name: "managed with hidden exiles", form: "full", perScale: { SELF: 2, ...MANAGERS_HIGH }, fallback: 1, durationSeconds: 600 },
  { name: "polarised", form: "full", perScale: { SELF: 2, ...MANAGERS_HIGH, ...FIREFIGHTERS_HIGH }, fallback: 2, durationSeconds: 600 },
  { name: "quiet or guarded", form: "short", perScale: { SELF: 3 }, fallback: 2, durationSeconds: 600 },
  { name: "polarised edge, gap 0.25", form: "full", perScale: { SELF: 2, PERF: [3, 4], CRIT: [3, 4], NUMB: [3, 3, 3, 4], ANGR: [3, 3, 3, 4] }, fallback: 2, durationSeconds: 600 },
  { name: "managed edge, gap 0.5", form: "full", perScale: { SELF: 2, PERF: [3, 4], CRIT: [3, 4], NUMB: 3, ANGR: 3 }, fallback: 2, durationSeconds: 600 },
  { name: "band boundaries at 2.5 and 3.5", form: "full", perScale: { SELF: [3, 4], PERF: [2, 3], CRIT: [3, 4], SHAM: [2, 3] }, fallback: 1, durationSeconds: 600 },
  { name: "team of protectors with self present", form: "full", perScale: { SELF: 4, PERF: 4, CRIT: 4, PLEA: [4, 4, 4, 3] }, fallback: 2, durationSeconds: 600 },
  { name: "straight-lining and too fast", form: "short", perScale: {}, fallback: 3, durationSeconds: 60 },
  { name: "acquiescence", form: "full", perScale: {}, fallback: 5, durationSeconds: 600 },
];

const fixture = {
  scoringVersion: SCORING_VERSION,
  itemBankVersion: ITEM_BANK_VERSION,
  cases: CASES.map((c) => {
    const responses = build(c.form, c.perScale, c.fallback);
    return { name: c.name, input: { form: c.form, durationSeconds: c.durationSeconds, responses }, result: score({ responses, form: c.form, durationSeconds: c.durationSeconds }) };
  }),
};

writeFileSync("tests/fixtures/core-golden.json", JSON.stringify(fixture, null, 1) + "\n");
console.log(fixture.cases.map((c) => `${c.result.pattern.key.padEnd(17)} ${c.name}`).join("\n"));
