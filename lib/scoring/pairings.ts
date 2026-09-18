import { SCORING } from "@/config/scoring";
import { PAIRINGS } from "@/content/pairings";
import type { ExileKey, Pairing, PartScaleScore, ProtectorKey } from "./types";

export function pairings(
  rankedProtectors: ProtectorKey[],
  scales: Record<ProtectorKey | ExileKey, PartScaleScore>,
): Pairing[] {
  const top = rankedProtectors.slice(0, SCORING.pairings.protectorTopN);
  const out: Pairing[] = [];
  for (const protector of top) {
    for (const exile of PAIRINGS[protector]) {
      if (scales[exile].mean >= SCORING.pairings.exileMin - 1e-9) out.push({ protector, exile });
    }
  }
  return out;
}
