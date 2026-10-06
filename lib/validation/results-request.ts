import { z } from "zod";
import { LOCALES } from "@/config/app";
import { itemsForForm } from "@/content/items.v2";

const response = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

const base = z.object({
  locale: z.enum(LOCALES),
  form: z.enum(["full", "short"]),
  responses: z.record(z.string().regex(/^[A-Z]{4}\d$/), response),
  durationSeconds: z.number().int().min(0).max(24 * 3600).optional(),
  ageConfirmed: z.literal(true),
  name: z.string().trim().min(1).max(120).optional(),
});

function completeForForm(data: z.infer<typeof base>, ctx: z.RefinementCtx) {
  const expected = itemsForForm(data.form);
  const missing = expected.filter((it) => data.responses[it.id] === undefined).length;
  if (missing > 0) ctx.addIssue({ code: "custom", path: ["responses"], message: `${missing} item(s) missing for the ${data.form} form` });
  const extra = Object.keys(data.responses).length - expected.length;
  if (extra > 0) ctx.addIssue({ code: "custom", path: ["responses"], message: `${extra} unexpected item(s)` });
}

export const pdfRequestSchema = base.superRefine(completeForForm);

export const emailRequestSchema = base
  .extend({
    // Required here: the name is printed in both PDFs and used in their filenames.
    name: z.string().trim().min(1).max(120),
    email: z.email().max(254),
    consent: z.object({
      storeResults: z.literal(true),
      newsletter: z.boolean().default(false),
      policyVersion: z.string().min(1).max(40),
    }),
  })
  .superRefine(completeForForm);

export type PdfRequest = z.infer<typeof pdfRequestSchema>;
export type EmailRequest = z.infer<typeof emailRequestSchema>;
