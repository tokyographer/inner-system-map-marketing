/**
 * Marketing settings for this repo. Values change with a deploy.
 */
import { CONSENT_POLICY_VERSION, type Locale } from "@/config/app";

/** Version of the marketing additions to the privacy notice (the "marketing" privacy section). DRAFT pending legal review. */
export const MARKETING_POLICY_VERSION = "m2026-10-draft";

/** Recorded with public-mode consent: the core notice version plus the marketing additions, e.g. "2026-09-draft+m2026-10-draft". */
export const PUBLIC_POLICY_VERSION = `${CONSENT_POLICY_VERSION}+${MARKETING_POLICY_VERSION}`;

/** Program page per locale, linked from the results page. PLACEHOLDER: every locale points at the homepage until the institute supplies the pages. */
export const PROGRAM_URL: Record<Locale, string> = {
  en: "https://transcendentinstitute.com",
  es: "https://transcendentinstitute.com",
  ro: "https://transcendentinstitute.com",
  tr: "https://transcendentinstitute.com",
};

/** Sign-up page of the next "Reading your map" live session per locale. Empty hides the link. */
export const LIVE_SESSION_URL: Record<Locale, string> = {
  en: "",
  es: "",
  ro: "",
  tr: "",
};

/** utm_source on every outbound link from the map. */
export const MAP_UTM_SOURCE = "inner-system-map";
