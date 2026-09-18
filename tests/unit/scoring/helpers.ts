import { itemsForForm } from "@/content/items.v2";
import type { Response, Responses, ScaleKey } from "@/lib/scoring/types";

/** Build a complete response set: default value for every item, overrides per scale. */
export function build(
  form: "full" | "short",
  perScale: Partial<Record<ScaleKey, Response | Response[]>>,
  fallback: Response = 1,
): Responses {
  const out: Responses = {};
  const counters: Partial<Record<ScaleKey, number>> = {};
  for (const it of itemsForForm(form)) {
    const override = perScale[it.scale];
    if (override === undefined) {
      out[it.id] = fallback;
    } else if (Array.isArray(override)) {
      const n = counters[it.scale] ?? 0;
      out[it.id] = override[n % override.length];
      counters[it.scale] = n + 1;
    } else {
      out[it.id] = override;
    }
  }
  return out;
}
