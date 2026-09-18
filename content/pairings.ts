/**
 * Theoretically expected protector → exile links (Triangle of Awareness,
 * Wound corner). Source: the school's handout wound column. Hypotheses only.
 */
import type { ExileKey, ProtectorKey } from "@/lib/scoring/types";

export const PAIRINGS: Record<ProtectorKey, ExileKey[]> = {
  PERF: ["SHAM"],
  CRIT: ["SHAM", "FEAR"],
  PLEA: ["ABAN"],
  CTRL: ["FEAR", "POWL"],
  INTL: ["SHAM", "LONE"],
  AVOI: ["SHAM", "POWL"],
  CARE: ["ABAN"],
  HYPV: ["FEAR"],
  DIST: ["ABAN", "LONE"],
  NUMB: ["LONE", "FEAR"],
  DISS: ["FEAR", "POWL"],
  ANGR: ["POWL", "SHAM"],
  IMPL: ["POWL", "FEAR"],
  REBL: ["POWL"],
};
