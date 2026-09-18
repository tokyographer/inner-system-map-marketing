import { SCORING } from "@/config/scoring";
import { EXILE_KEYS, PROTECTOR_KEYS, type ExileKey, type PartScaleScore, type ProtectorKey } from "./types";

const EPS = 1e-9;

export function compareScales(a: PartScaleScore, b: PartScaleScore): number {
  if (Math.abs(b.mean - a.mean) > EPS) return b.mean - a.mean;
  if (b.highCount !== a.highCount) return b.highCount - a.highCount;
  return a.key.localeCompare(b.key);
}

export function rankProtectors(scales: Record<ProtectorKey | ExileKey, PartScaleScore>): ProtectorKey[] {
  return [...PROTECTOR_KEYS].map((k) => scales[k]).sort(compareScales).map((s) => s.key as ProtectorKey);
}

export function rankExiles(scales: Record<ProtectorKey | ExileKey, PartScaleScore>): ExileKey[] {
  return [...EXILE_KEYS].map((k) => scales[k]).sort(compareScales).map((s) => s.key as ExileKey);
}

/**
 * Leading protector: top is at least `min` AND at least `gap` above the second.
 * Otherwise a team of the top two, plus the third when it sits within
 * `teamThirdGap` of the second.
 */
export function leadingOrTeam(
  ranked: ProtectorKey[],
  scales: Record<ProtectorKey | ExileKey, PartScaleScore>,
): { leading: ProtectorKey | null; team: ProtectorKey[] } {
  const L = SCORING.leadingProtector;
  const [first, second, third] = ranked;
  const m = (k: ProtectorKey) => scales[k].mean;
  if (m(first) >= L.min - EPS && m(first) - m(second) >= L.gap - EPS) {
    return { leading: first, team: [] };
  }
  const team: ProtectorKey[] = [first, second];
  if (m(second) - m(third) <= L.teamThirdGap + EPS) team.push(third);
  return { leading: null, team };
}
