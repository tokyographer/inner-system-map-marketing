import { describe, expect, it } from "vitest";
import { aggregate, type ParticipantRow } from "@/lib/dashboard/aggregate";
import { buildCsv } from "@/lib/dashboard/csv";
import { generateAccessCode, hashAccessCode } from "@/lib/dashboard/access-code";
import { score } from "@/lib/scoring";
import { build } from "../scoring/helpers";

function row(i: number, result = score({ form: "short", responses: build("short", { PERF: 5, SHAM: 3 }, 2) })): ParticipantRow {
  return { userId: `u${i}`, pseudonym: `p${i}`, displayName: null, email: null, joinedAt: "2026-01-01", attemptCount: 1, latest: { attemptId: `a${i}`, completedAt: "2026-01-02", result } };
}

describe("aggregate", () => {
  it("is suppressed below five completed participants", () => {
    const a = aggregate([row(1), row(2), row(3), row(4), { ...row(5), latest: null }]);
    expect(a.completed).toBe(4);
    expect(a.suppressed).toBe(true);
    expect(Object.values(a.patterns).every((n) => n === 0)).toBe(true);
  });
  it("counts patterns and leading protectors and averages scales at five or more", () => {
    const a = aggregate([row(1), row(2), row(3), row(4), row(5)]);
    expect(a.suppressed).toBe(false);
    expect(a.patterns.MANAGED).toBe(5);
    expect(a.leadingProtectors.PERF).toBe(5);
    expect(a.meanScales.PERF).toBe(5);
    expect(a.meanSelf).toBe(2);
  });
});

describe("csv", () => {
  it("pseudonymised export has no email or name columns; identified has both", () => {
    const r = score({ form: "short", responses: build("short", {}, 3) });
    const base = { attemptId: "a", pseudonym: "p", email: "x@y.z", displayName: "Zed, \"Z\"", cohortId: "c", form: "short", locale: "en", itemBankVersion: "v2", scoringVersion: "s", completedAt: "t", durationSeconds: 300, responses: build("short", {}, 3) as Record<string, number>, result: r };
    const anon = buildCsv([base], false);
    const ident = buildCsv([base], true);
    expect(anon.split("\n")[0]).not.toContain("email");
    expect(anon).not.toContain("x@y.z");
    expect(ident.split("\n")[0]).toContain("email,display_name");
    expect(ident).toContain('"Zed, ""Z"""');
    expect(anon.split("\n")[0].split(",")).toContain("SELF1");
    expect(anon.split("\n")[1].split(",").length).toBe(anon.split("\n")[0].split(",").length);
  });
});

describe("access codes", () => {
  it("generates readable codes and hashes like the SQL function", () => {
    const code = generateAccessCode();
    expect(code).toMatch(/^TI-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(hashAccessCode(" Abc-123 ")).toBe(hashAccessCode("abc-123"));
    expect(hashAccessCode("abc-123")).toHaveLength(64);
  });
});
