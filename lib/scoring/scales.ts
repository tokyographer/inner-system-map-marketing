import { SCORING } from "@/config/scoring";
import { itemsForForm, type Item } from "@/content/items.v2";
import type { Band, Responses, ScaleKey, ScaleScore, SelfBand } from "./types";

export function toDisplay(mean: number): number {
  return Math.round(((mean - 1) / 4) * 100);
}

export function partBand(mean: number): Band {
  if (mean >= SCORING.bands.veryActive) return "veryActive";
  if (mean >= SCORING.bands.present) return "present";
  return "quiet";
}

export function selfBand(mean: number): SelfBand {
  if (mean >= SCORING.selfBands.oftenAvailable) return "oftenAvailable";
  if (mean >= SCORING.selfBands.availableAtTimes) return "availableAtTimes";
  return "hardToReach";
}

export function round(n: number, places = 4): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

export function scaleScore(key: ScaleKey, items: Item[], responses: Responses): ScaleScore {
  const own = items.filter((it) => it.scale === key);
  const values = own.map((it) => responses[it.id]);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = round(sum / values.length);
  return {
    key,
    mean,
    display: toDisplay(mean),
    itemCount: values.length,
    highCount: values.filter((v) => v >= 4).length,
  };
}

export function assertComplete(form: "full" | "short", responses: Responses): Item[] {
  const items = itemsForForm(form);
  const missing = items.filter((it) => {
    const v = responses[it.id];
    return !(v === 1 || v === 2 || v === 3 || v === 4 || v === 5);
  });
  if (missing.length > 0) {
    throw new Error(`Incomplete responses: ${missing.length} item(s) missing or invalid (${missing.slice(0, 5).map((m) => m.id).join(", ")})`);
  }
  return items;
}
