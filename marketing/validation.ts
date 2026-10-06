/**
 * Zod schemas for request fields only the marketing features need. Routes parse
 * them next to the core schema (never by extending lib/validation/). Invalid
 * marketing fields are dropped; they never fail the core request.
 */
import { z } from "zod";

/** Partner code from `?ref=CODE`: lowercase letters, digits and hyphens. */
export const REF_CODE = /^[a-z0-9][a-z0-9-]{1,31}$/;

/** Slug-like campaign values only, so a link cannot carry a name or subscriber id into the result row. */
export const UTM_VALUE = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const utmValue = z.string().regex(UTM_VALUE);

export const attributionSchema = z.object({
  utmSource: utmValue.optional(),
  utmMedium: utmValue.optional(),
  utmCampaign: utmValue.optional(),
  ref: z.string().regex(REF_CODE).optional(),
});

export type Attribution = z.infer<typeof attributionSchema>;

/** Reads the marketing fields of POST /api/public/email-results from the parsed body, field by field: an invalid field is dropped, the rest kept. Never throws. */
export function parseEmailMarketingFields(json: unknown): { attribution: Attribution | null } {
  const raw = json && typeof json === "object" ? (json as { attribution?: unknown }).attribution : undefined;
  if (!raw || typeof raw !== "object") return { attribution: null };
  const attribution: Attribution = {};
  for (const field of Object.keys(attributionSchema.shape) as (keyof Attribution)[]) {
    const parsed = attributionSchema.shape[field].safeParse((raw as Record<string, unknown>)[field]);
    if (parsed.success && parsed.data) attribution[field] = parsed.data;
  }
  return { attribution: Object.keys(attribution).length > 0 ? attribution : null };
}

export const FUNNEL_COUNTED = ["start", "complete"] as const;
export type CountedEvent = (typeof FUNNEL_COUNTED)[number];

/** POST /api/marketing/funnel: one start or completion, with the partner code if any. */
export const funnelCountSchema = z.object({
  event: z.enum(FUNNEL_COUNTED),
  ref: z.string().regex(REF_CODE).optional(),
});

/** Admin: register a partner code. */
export const registerPartnerSchema = z.object({
  code: z.string().trim().toLowerCase().regex(REF_CODE),
  label: z.string().trim().min(1).max(120),
});

/** Admin: remove a partner code. */
export const partnerCodeSchema = z.object({ code: z.string().regex(REF_CODE) });
