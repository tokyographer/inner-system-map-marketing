/**
 * App-level constants. Copy strings live in messages/ and content/, not here.
 */
export const APP_NAME = {
  en: "Inner System Map",
  es: "Mapa del Sistema Interno",
  ro: "Harta Sistemului Interior",
} as const;

export type Locale = keyof typeof APP_NAME;
export const LOCALES: Locale[] = ["en", "es", "ro"];
export const DEFAULT_LOCALE: Locale = "en";

export type Mode = "public" | "cohort";
export type Form = "full" | "short";

export const DEFAULT_FORM: Record<Mode, Form> = {
  public: "short",
  cohort: "full",
};

export const ITEM_BANK_VERSION = "v2" as const;

export const MIN_COMPLETED_FOR_AGGREGATES = 5;
export const PUBLIC_RESULTS_RETENTION_MONTHS = 6;
export const COHORT_RETENTION_MONTHS = 12;
export const CONSENT_POLICY_VERSION = "2026-09-draft";
