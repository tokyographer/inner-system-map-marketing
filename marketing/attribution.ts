/**
 * Source attribution: utm_source, utm_medium, utm_campaign and the partner
 * code `ref`. Read from the URL into memory on any page; written to
 * localStorage only when the person submits the start form (consent), so it
 * survives reloads through the questionnaire and travels with the results
 * request. Every storage access is wrapped; a blocked storage only loses the
 * attribution.
 */
import { attributionSchema, type Attribution } from "./validation";

export const ATTRIBUTION_KEY = "ism:mkt:attribution:v1";
export const ATTRIBUTION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const PARAMS = { utmSource: "utm_source", utmMedium: "utm_medium", utmCampaign: "utm_campaign", ref: "ref" } as const;

interface Stored { attribution: Attribution; capturedAt: number }

/** Captured from the URL in this page session, not yet stored on the device. */
let pending: Attribution | null = null;

/** Attribution in a query string, or null when it has none. Values are lowercased; invalid ones are dropped one by one. */
export function attributionFromSearch(search: string): Attribution | null {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  for (const [field, param] of Object.entries(PARAMS) as [keyof Attribution, string][]) {
    const raw = params.get(param)?.trim().toLowerCase();
    if (!raw) continue;
    const parsed = attributionSchema.shape[field].safeParse(raw);
    if (parsed.success && parsed.data) out[field] = parsed.data;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function local(): Storage | undefined {
  try { return typeof window === "undefined" ? undefined : window.localStorage; } catch { return undefined; }
}

/** Keeps the URL's attribution in memory. Last touch wins: a URL without attribution keeps what was there. */
export function captureAttribution(search: string): void {
  pending = attributionFromSearch(search) ?? pending;
}

/** Called when the person submits the start form: stores the in-memory attribution on the device. */
export function commitAttribution(now = Date.now()): void {
  if (!pending) return;
  try { local()?.setItem(ATTRIBUTION_KEY, JSON.stringify({ attribution: pending, capturedAt: now } satisfies Stored)); } catch { /* storage blocked */ }
}

function loadStored(now: number): Attribution | null {
  try {
    const raw = local()?.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (typeof stored.capturedAt !== "number" || now - stored.capturedAt > ATTRIBUTION_MAX_AGE_MS) return null;
    const parsed = attributionSchema.safeParse(stored.attribution);
    return parsed.success && Object.keys(parsed.data).length > 0 ? parsed.data : null;
  } catch {
    return null;
  }
}

/** This page session's attribution, otherwise the stored one (at most 30 days old). */
export function loadAttribution(now = Date.now()): Attribution | null {
  return pending ?? loadStored(now);
}

/** Spread into the body of POST /api/public/email-results. Empty when there is no attribution. */
export function attributionRequestFields(): { attribution?: Attribution } {
  const attribution = loadAttribution();
  return attribution ? { attribution } : {};
}

/** Test helper: forget the in-memory attribution. */
export function resetPendingAttribution(): void {
  pending = null;
}
