import { z } from "zod";
import { LOCALES } from "@/config/app";
import { PROTECTOR_KEYS } from "@/lib/scoring/types";

export const accessCodeSchema = z.string().trim().min(6).max(32).regex(/^[A-Za-z0-9-]+$/);

export const joinRequestSchema = z.object({
  code: accessCodeSchema,
  email: z.email().max(254),
  locale: z.enum(LOCALES),
});

export const verifyCodeSchema = z.object({
  email: z.email().max(254),
  otp: z.string().trim().regex(/^\d{6}$/),
  locale: z.enum(LOCALES),
});

export const consentSchema = z.object({
  code: accessCodeSchema,
  storeAndShare: z.literal(true),
  newsletter: z.boolean().default(false),
  policyVersion: z.string().min(1).max(40),
  locale: z.enum(LOCALES),
});

const response = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

export const cohortAttemptSchema = z.object({
  cohortId: z.uuid(),
  locale: z.enum(LOCALES),
  form: z.enum(["full", "short"]),
  seed: z.number().int().min(0).max(4294967295),
  startedAt: z.number().int().positive(),
  completedAt: z.number().int().positive(),
  responses: z.record(z.string().regex(/^[A-Z]{4}\d$/), response),
})
  .refine((d) => d.completedAt >= d.startedAt, { path: ["completedAt"], message: "completedAt must not precede startedAt" })
  // Client clocks feed the TOO_FAST flag and the stored dates, so keep them near server time: not in the future, started within the last 30 days.
  .refine((d) => d.completedAt <= Date.now() + 60_000, { path: ["completedAt"], message: "completedAt is in the future" })
  .refine((d) => d.startedAt >= Date.now() - 30 * 24 * 3600 * 1000, { path: ["startedAt"], message: "startedAt is too old" });

export const noteSchema = z.object({
  attemptId: z.uuid(),
  protectorKey: z.enum(PROTECTOR_KEYS as unknown as [string, ...string[]]),
  body: z.string().max(4000),
  shareWithFacilitator: z.boolean(),
});

export type JoinRequest = z.infer<typeof joinRequestSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;
export type CohortAttemptInput = z.infer<typeof cohortAttemptSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
