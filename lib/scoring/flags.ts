import { SCORING } from "@/config/scoring";
import type { Item } from "@/content/items.v2";
import type { Leads, PatternKey, QualityFlag, Responses } from "./types";

export function qualityFlags(args: {
  items: Item[];
  responses: Responses;
  form: "full" | "short";
  durationSeconds?: number;
  self: number;
  leads: Leads;
}): QualityFlag[] {
  const Q = SCORING.quality;
  const out: QualityFlag[] = [];
  const values = args.items.map((it) => args.responses[it.id]);
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const maxShare = Math.max(...counts.values()) / values.length;
  if (maxShare >= Q.straightLiningShare - 1e-9) out.push("STRAIGHT_LINING");

  if (args.durationSeconds !== undefined) {
    const min = args.form === "full" ? Q.minSecondsFull : Q.minSecondsShort;
    if (args.durationSeconds < min) out.push("TOO_FAST");
  }
  if (args.self >= Q.acquiescenceSelfMin - 1e-9 && args.leads.protectionLoad >= Q.acquiescenceLoadMin - 1e-9) {
    out.push("ACQUIESCENCE");
  }
  return out;
}

export function careFlag(pattern: PatternKey, leads: Leads): boolean {
  return pattern === "FLOODED" || leads.exile >= SCORING.care.exileLeadMin - 1e-9;
}
