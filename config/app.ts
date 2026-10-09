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

/** The five guided steps of "Meet this part" are shown only once the school has supplied them. */
export const EXERCISE_STEPS_READY = false;

/**
 * WhatsApp delivery of the results PDF (public mode). Turn on only after Meta has approved the
 * template in all four locales and the WHATSAPP_* env vars are set in every environment.
 */
export const WHATSAPP_RESULTS_READY = false;
/** Language code of each approved template translation, exactly as WhatsApp Manager lists it. */
export const WHATSAPP_TEMPLATE_LANGUAGE: Record<Locale, string> = { en: "en", es: "es", ro: "ro", tr: "tr" };

/**
 * Admin WhatsApp inbox: the webhook stores replies to the business number and admins answer them
 * within WhatsApp's 24-hour window. Turn on only after migration 0011 is applied and the webhook
 * is configured in Meta with WHATSAPP_APP_SECRET and WHATSAPP_VERIFY_TOKEN set.
 */
export const WHATSAPP_INBOX_READY = false;
/** How long WhatsApp messages are kept in the inbox. */
export const WHATSAPP_RETENTION_MONTHS = 6;

/** Changes with the privacy notice: each WhatsApp switch adds wording to it. */
export const CONSENT_POLICY_VERSION = WHATSAPP_INBOX_READY ? "2026-10-whatsapp-inbox-draft" : WHATSAPP_RESULTS_READY ? "2026-10-whatsapp-draft" : "2026-09-draft";
