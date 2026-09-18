import { round } from "./scales";
import {
  EXILE_KEYS, FIREFIGHTER_KEYS, MANAGER_KEYS, PROTECTOR_KEYS,
  type ExileKey, type Leads, type PartScaleScore, type ProtectorKey,
} from "./types";

function meanOfTopTwo(means: number[]): number {
  const sorted = [...means].sort((a, b) => b - a);
  return round((sorted[0] + sorted[1]) / 2);
}

export function leads(scales: Record<ProtectorKey | ExileKey, PartScaleScore>): Leads {
  const m = (keys: readonly (ProtectorKey | ExileKey)[]) => keys.map((k) => scales[k].mean);
  const protectorMeans = m(PROTECTOR_KEYS);
  return {
    manager: meanOfTopTwo(m(MANAGER_KEYS)),
    firefighter: meanOfTopTwo(m(FIREFIGHTER_KEYS)),
    exile: meanOfTopTwo(m(EXILE_KEYS)),
    protectionLoad: round(protectorMeans.reduce((a, b) => a + b, 0) / protectorMeans.length),
  };
}
