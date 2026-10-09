import { z } from "zod";
import { LOCALES } from "@/config/app";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createCohortSchema = z.object({
  name: z.string().trim().min(2).max(120),
  level: z.string().trim().min(1).max(10),
  language: z.enum(LOCALES),
  startsOn: isoDate.optional().or(z.literal("")),
  endsOn: isoDate.optional().or(z.literal("")),
  codeExpiresOn: isoDate,
  retentionMonths: z.coerce.number().int().min(1).max(60),
});

export const assignFacilitatorSchema = z.object({
  cohortId: z.uuid(),
  email: z.email().max(254),
});

export type CreateCohortInput = z.infer<typeof createCohortSchema>;

// Filters for the admin "All results" page. Query-string safe: no names or emails.
const optional = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

export const resultsFilterSchema = z.object({
  source: optional(z.enum(["public", "cohort"])),
  cohort: optional(z.uuid()),
  locale: optional(z.enum(LOCALES)),
  from: optional(isoDate),
  to: optional(isoDate),
  page: optional(z.coerce.number().int().min(1).max(10_000)),
});

export const resultRefSchema = z.object({
  source: z.enum(["public", "cohort"]),
  id: z.uuid(),
});

export const pdfLocaleSchema = z.enum(LOCALES).default("en");

export type ResultsFilter = z.infer<typeof resultsFilterSchema>;
