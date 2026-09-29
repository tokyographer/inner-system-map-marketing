import { describe, expect, it } from "vitest";
import { accessCodeSchema, cohortAttemptSchema, consentSchema, joinRequestSchema, noteSchema } from "@/lib/validation/cohort";
import { build } from "../scoring/helpers";

const uuid = "123e4567-e89b-42d3-a456-426614174000";

describe("cohort validation", () => {
  it("access codes are 6–32 chars of letters, digits, hyphens", () => {
    expect(accessCodeSchema.safeParse(" abc-123 ").success).toBe(true);
    expect(accessCodeSchema.safeParse("abc").success).toBe(false);
    expect(accessCodeSchema.safeParse("abc 123").success).toBe(false);
  });
  it("join requires code, email and locale", () => {
    expect(joinRequestSchema.safeParse({ code: "ABC123", email: "a@b.co", locale: "es" }).success).toBe(true);
    expect(joinRequestSchema.safeParse({ code: "ABC123", email: "nope", locale: "es" }).success).toBe(false);
    expect(joinRequestSchema.safeParse({ code: "ABC123", email: "a@b.co", locale: "fr" }).success).toBe(false);
  });
  it("consent requires the store-and-share tick; newsletter defaults false", () => {
    const ok = consentSchema.safeParse({ code: "ABC123", storeAndShare: true, policyVersion: "v1", locale: "en" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.newsletter).toBe(false);
    expect(consentSchema.safeParse({ code: "ABC123", storeAndShare: false, policyVersion: "v1", locale: "en" }).success).toBe(false);
  });
  it("cohort attempt requires complete responses and sane timestamps", () => {
    const base = { cohortId: uuid, locale: "en", form: "full", seed: 42, startedAt: 1000, completedAt: 2000 };
    expect(cohortAttemptSchema.safeParse({ ...base, responses: build("full", {}, 3) }).success).toBe(true);
    expect(cohortAttemptSchema.safeParse({ ...base, completedAt: 500, responses: build("full", {}, 3) }).success).toBe(false);
    expect(cohortAttemptSchema.safeParse({ ...base, cohortId: "nope", responses: build("full", {}, 3) }).success).toBe(false);
  });
  it("notes only accept protector keys and bounded bodies", () => {
    expect(noteSchema.safeParse({ attemptId: uuid, protectorKey: "PERF", body: "x", shareWithFacilitator: false }).success).toBe(true);
    expect(noteSchema.safeParse({ attemptId: uuid, protectorKey: "SHAM", body: "x", shareWithFacilitator: false }).success).toBe(false);
    expect(noteSchema.safeParse({ attemptId: uuid, protectorKey: "PERF", body: "x".repeat(4001), shareWithFacilitator: false }).success).toBe(false);
  });
});
