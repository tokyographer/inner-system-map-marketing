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
