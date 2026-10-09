/**
 * App-level constants. Copy strings live in messages/ and content/, not here.
 */
export const APP_NAME = {
  en: "Inner System Map",
  es: "Mapa del Sistema Interno",
  ro: "Harta Sistemului Interior",
  tr: "İç Sistem Haritası",
} as const;

export type Locale = keyof typeof APP_NAME;
export const LOCALES: Locale[] = ["en", "es", "ro", "tr"];
export const DEFAULT_LOCALE: Locale = "en";

/** Each language's name in its own language, for switchers and download buttons. */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", es: "Español", ro: "Română", tr: "Türkçe" };

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

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

/** The five guided steps of "Meet this part" are shown only once the school has supplied them. */
export const EXERCISE_STEPS_READY = false;
