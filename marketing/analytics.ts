/**
 * Cookieless funnel analytics through Vercel Web Analytics custom events.
 * The event names and their properties are a closed list: no responses,
 * emails, names, scores or patterns can be sent, by type and at runtime.
 */
import { track } from "@vercel/analytics";
import { attributionFromSearch } from "./attribution";

export const FUNNEL_EVENTS = ["landing_view", "start", "halfway", "completion", "email_sent", "invite_click"] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export interface FunnelProps {
  locale: string;
  /** invite_click only: which link was clicked. */
  target?: "program" | "live_session";
}

/** No partner code: a visitor can type any code, and only registered codes are counted, in our own database. */
const ALLOWED_KEYS: readonly (keyof FunnelProps)[] = ["locale", "target"];

/** Copies only the allowed keys, so a caller can never widen what is sent. */
export function eventProps(props: FunnelProps): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of ALLOWED_KEYS) {
    const value = props[key];
    if (typeof value === "string" && value) out[key] = value.slice(0, 64);
  }
  return out;
}

const PARAM_OF = { utmSource: "utm_source", utmMedium: "utm_medium", utmCampaign: "utm_campaign" } as const;

/** Public pages only: cohort, facilitator and admin URLs carry record ids and are never sent. */
const PUBLIC_PATH = /^\/(en|es|ro|tr)(\/(start|questionnaire|results|privacy|results-deleted))?\/?$/;

/**
 * Page and event URLs sent to analytics: public pages only, reduced to the path plus the attribution
 * parameters that pass validation (slugs only, so a merge tag cannot carry a name or email). Null drops it.
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!PUBLIC_PATH.test(u.pathname)) return null;
    const attribution = attributionFromSearch(u.search) ?? {};
    const kept = new URLSearchParams();
    for (const [field, param] of Object.entries(PARAM_OF) as [keyof typeof PARAM_OF, string][]) {
      const value = attribution[field];
      if (value) kept.set(param, value);
    }
    const query = kept.toString();
    return `${u.origin}${u.pathname}${query ? `?${query}` : ""}`;
  } catch {
    return null;
  }
}

/** The beforeSend hook for every page view and event. */
export function analyticsBeforeSend<E extends { url: string }>(event: E): E | null {
  const url = sanitizeUrl(event.url);
  return url ? { ...event, url } : null;
}

type QueueWindow = Window & { va?: (...params: unknown[]) => void; vaq?: unknown[][] };

/**
 * `track()` drops events until the <Analytics> component has created `window.va`, and that component hydrates
 * inside a Suspense boundary, after page effects such as landing_view. Create the same queue the script drains,
 * with beforeSend first, so no queued event is sent before its URL is sanitised.
 */
function ensureQueue(): void {
  const w = window as QueueWindow;
  if (w.va) return;
  w.va = (...params: unknown[]) => { (w.vaq ??= []).push(params); };
  w.va("beforeSend", analyticsBeforeSend);
}

export function trackFunnel(event: FunnelEvent, props: FunnelProps): void {
  try { ensureQueue(); track(event, eventProps(props)); } catch { /* analytics must never break the page */ }
}
