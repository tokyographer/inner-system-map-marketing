import { describe, expect, it } from "vitest";
import { emailRequestSchema, pdfRequestSchema } from "@/lib/validation/results-request";
import { build } from "../scoring/helpers";

const valid = { locale: "en", form: "short", responses: build("short", {}, 3), ageConfirmed: true };

describe("request validation", () => {
  it("accepts a complete short-form request", () => {
    expect(pdfRequestSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects missing items, extra items, bad values and no age confirmation", () => {
    const missing = { ...valid, responses: { ...valid.responses } }; delete missing.responses.SELF1;
    expect(pdfRequestSchema.safeParse(missing).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ ...valid, responses: { ...valid.responses, ZZZZ9: 3 } }).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ ...valid, responses: { ...valid.responses, SELF1: 6 } }).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ ...valid, ageConfirmed: false }).success).toBe(false);
  });
  it("full form requires all 84 items", () => {
    expect(pdfRequestSchema.safeParse({ ...valid, form: "full" }).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ ...valid, form: "full", responses: build("full", {}, 3) }).success).toBe(true);
  });
  it("email request requires explicit storeResults consent and a valid email; newsletter defaults false", () => {
    const ok = emailRequestSchema.safeParse({ ...valid, email: "a@b.co", consent: { storeResults: true, policyVersion: "v1" } });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.consent.newsletter).toBe(false);
    expect(emailRequestSchema.safeParse({ ...valid, email: "a@b.co", consent: { storeResults: false, policyVersion: "v1" } }).success).toBe(false);
    expect(emailRequestSchema.safeParse({ ...valid, email: "not-an-email", consent: { storeResults: true, policyVersion: "v1" } }).success).toBe(false);
  });
});
