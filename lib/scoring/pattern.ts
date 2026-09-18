import { SCORING } from "@/config/scoring";
import type { Leads, ModifierKey, Pattern, PatternKey } from "./types";

const P = SCORING.pattern;
const EPS = 1e-9;
const gte = (a: number, b: number) => a >= b - EPS;
const lt = (a: number, b: number) => a < b - EPS;

export function patternKey(self: number, l: Leads): PatternKey {
  if (gte(self, P.selfLedSelfMin) && lt(l.manager, P.selfLedLeadsMax) && lt(l.firefighter, P.selfLedLeadsMax) && lt(l.exile, P.selfLedLeadsMax)) {
    return "SELF_LED";
  }
  if (gte(l.exile, P.floodedExileMin) && gte(l.exile, l.manager - P.floodedMargin) && gte(l.exile, l.firefighter - P.floodedMargin)) {
    return "FLOODED";
  }
  if (gte(l.firefighter, P.groupLeadMin) && gte(l.firefighter, l.manager + P.groupLeadGap)) {
    return "REACTIVE";
  }
  if (gte(l.manager, P.groupLeadMin) && gte(l.manager, l.firefighter + P.groupLeadGap)) {
    return "MANAGED";
  }
  if (gte(l.manager, P.groupLeadMin) && gte(l.firefighter, P.groupLeadMin) && Math.abs(l.manager - l.firefighter) <= P.groupLeadGap + EPS) {
    return "POLARISED";
  }
  return "QUIET_OR_GUARDED";
}

export function modifiers(key: PatternKey, self: number, l: Leads): ModifierKey[] {
  const out: ModifierKey[] = [];
  if ((key === "MANAGED" || key === "REACTIVE" || key === "POLARISED") && lt(l.exile, P.hiddenExilesMax)) {
    out.push("HIDDEN_EXILES");
  }
  if (key !== "SELF_LED" && gte(self, P.selfPresentMin)) {
    out.push("SELF_PRESENT");
  }
  return out;
}

export function systemPattern(self: number, l: Leads): Pattern {
  const key = patternKey(self, l);
  return { key, modifiers: modifiers(key, self, l), evidence: { self, ...l } };
}
