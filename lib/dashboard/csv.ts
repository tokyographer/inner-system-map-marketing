/**
 * CSV builders. Item-level rows, one per attempt. The pseudonymised export
 * never includes email or display name; the identified one is admin-only.
 */
import { ITEMS } from "@/content/items.v2";
import type { Result } from "@/lib/scoring/types";

export interface AttemptExportRow {
  attemptId: string;
  pseudonym: string;
  email?: string | null;
  displayName?: string | null;
  cohortId: string;
  form: string;
  locale: string;
  itemBankVersion: string;
  scoringVersion: string;
  completedAt: string;
  durationSeconds: number;
  responses: Record<string, number>;
  result: Result;
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(rows: AttemptExportRow[], identified: boolean): string {
  const scaleKeys = Object.keys(rows[0]?.result.scales ?? {});
  const header = [
    "attempt_id", "pseudonym", ...(identified ? ["email", "display_name"] : []), "cohort_id", "form", "locale", "item_bank_version", "scoring_version",
    "completed_at", "duration_seconds", "pattern", "modifiers", "self_mean", "manager_lead", "firefighter_lead", "exile_lead", "protection_load",
    "leading_protector", "quality_flags", "care_flag", ...scaleKeys.map((k) => `${k}_mean`), ...ITEMS.map((i) => i.id),
  ];
  const lines = rows.map((r) => [
    r.attemptId, r.pseudonym, ...(identified ? [r.email, r.displayName] : []), r.cohortId, r.form, r.locale, r.itemBankVersion, r.scoringVersion,
    r.completedAt, r.durationSeconds, r.result.pattern.key, r.result.pattern.modifiers.join("|"), r.result.self.mean, r.result.leads.manager,
    r.result.leads.firefighter, r.result.leads.exile, r.result.leads.protectionLoad, r.result.protectors.leading ?? "", r.result.qualityFlags.join("|"),
    r.result.careFlag, ...scaleKeys.map((k) => r.result.scales[k as keyof typeof r.result.scales].mean), ...ITEMS.map((i) => r.responses[i.id] ?? ""),
  ].map(cell).join(","));
  return [header.map(cell).join(","), ...lines].join("\n") + "\n";
}
