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

/** Marketing-only fields of POST /api/public/email-results. */
export const emailMarketingFieldsSchema = z.object({ attribution: attributionSchema.optional() });

/** Reads the marketing fields from an already-parsed request body. Never throws. */
export function parseEmailMarketingFields(json: unknown): { attribution: Attribution | null } {
  const parsed = emailMarketingFieldsSchema.safeParse(json);
  const attribution = parsed.success ? parsed.data.attribution : undefined;
  return { attribution: attribution && Object.keys(attribution).length > 0 ? attribution : null };
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
