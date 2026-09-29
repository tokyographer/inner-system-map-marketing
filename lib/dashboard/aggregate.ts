/**
 * Pure aggregation over stored attempts for the cohort view. Aggregates are
 * suppressed below MIN_COMPLETED_FOR_AGGREGATES completed participants.
 */
import { MIN_COMPLETED_FOR_AGGREGATES } from "@/config/app";
import { EXILE_KEYS, PROTECTOR_KEYS, type ExileKey, type PatternKey, type ProtectorKey, type Result } from "@/lib/scoring/types";

export interface ParticipantRow {
  userId: string;
  pseudonym: string;
  displayName: string | null;
  email: string | null;
  joinedAt: string;
  attemptCount: number;
  latest: { attemptId: string; completedAt: string; result: Result } | null;
}

export interface Aggregate {
  completed: number;
  suppressed: boolean;
  patterns: Record<PatternKey, number>;
  leadingProtectors: Record<ProtectorKey, number>;
  meanScales: Record<ProtectorKey | ExileKey, number>;
  meanSelf: number;
  careFlags: number;
}

const PATTERNS: PatternKey[] = ["SELF_LED", "FLOODED", "REACTIVE", "MANAGED", "POLARISED", "QUIET_OR_GUARDED"];

export function aggregate(rows: ParticipantRow[]): Aggregate {
  const results = rows.flatMap((r) => (r.latest ? [r.latest.result] : []));
  const completed = results.length;
  const patterns = Object.fromEntries(PATTERNS.map((p) => [p, 0])) as Record<PatternKey, number>;
  const leadingProtectors = Object.fromEntries(PROTECTOR_KEYS.map((k) => [k, 0])) as Record<ProtectorKey, number>;
  const meanScales = Object.fromEntries([...PROTECTOR_KEYS, ...EXILE_KEYS].map((k) => [k, 0])) as Record<ProtectorKey | ExileKey, number>;
  let meanSelf = 0;
  let careFlags = 0;
  const suppressed = completed < MIN_COMPLETED_FOR_AGGREGATES;
  if (!suppressed) {
    for (const r of results) {
      patterns[r.pattern.key] += 1;
      leadingProtectors[r.protectors.ranked[0]] += 1;
      for (const k of [...PROTECTOR_KEYS, ...EXILE_KEYS]) meanScales[k] += r.scales[k].mean / completed;
      meanSelf += r.self.mean / completed;
      if (r.careFlag) careFlags += 1;
    }
    for (const k of Object.keys(meanScales) as (ProtectorKey | ExileKey)[]) meanScales[k] = Math.round(meanScales[k] * 100) / 100;
    meanSelf = Math.round(meanSelf * 100) / 100;
  }
  return { completed, suppressed, patterns, leadingProtectors, meanScales, meanSelf, careFlags };
}
