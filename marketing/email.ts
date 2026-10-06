/**
 * Marketing additions to the results email, passed to the core sendResultsEmail:
 * attribution lines for the institute copy (English) and the live-session line
 * for the person's email (their locale). The core drops the person's footer when
 * the pattern is FLOODED. Pure functions; the route supplies translations.
 */
import type { Locale } from "@/config/app";
import { liveSessionUrl } from "./links";
import type { Attribution } from "./validation";

/** English labels. The partner code is included only when it is registered (never a visitor-typed code). */
export function instituteDetails(a: Attribution | null, registeredRef: string | null): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  if (a?.utmSource) lines.push({ label: "Source", value: a.utmSource });
  if (a?.utmMedium) lines.push({ label: "Medium", value: a.utmMedium });
  if (a?.utmCampaign) lines.push({ label: "Campaign", value: a.utmCampaign });
  if (registeredRef) lines.push({ label: "Partner", value: registeredRef });
  return lines;
}

/** The person's live-session line, or undefined when no session is configured for the locale. */
export function liveSessionFooter(locale: Locale, template: (url: string) => string, urls?: Record<Locale, string>): string | undefined {
  const url = liveSessionUrl(locale, urls);
  return url ? template(url) : undefined;
}
