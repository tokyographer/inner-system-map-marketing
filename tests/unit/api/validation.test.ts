import { describe, expect, it } from "vitest";
import { emailRequestSchema, pdfRequestSchema } from "@/lib/validation/results-request";
import { cleanDisplayName } from "@/lib/validation/name";
import { isWhatsAppNumber, normalizeWhatsApp } from "@/lib/validation/whatsapp";
import { whatsappConversationIdSchema, whatsappReplySchema } from "@/lib/validation/admin";
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
  it("email request requires a name, explicit storeResults consent and a valid email; newsletter defaults false", () => {
    const ok = emailRequestSchema.safeParse({ ...valid, name: "Ana", email: "a@b.co", consent: { storeResults: true, policyVersion: "v1" } });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.consent.newsletter).toBe(false);
    expect(emailRequestSchema.safeParse({ ...valid, email: "a@b.co", consent: { storeResults: true, policyVersion: "v1" } }).success).toBe(false);
    expect(emailRequestSchema.safeParse({ ...valid, name: "   ", email: "a@b.co", consent: { storeResults: true, policyVersion: "v1" } }).success).toBe(false);
    expect(emailRequestSchema.safeParse({ ...valid, name: "Ana", email: "a@b.co", consent: { storeResults: false, policyVersion: "v1" } }).success).toBe(false);
    expect(emailRequestSchema.safeParse({ ...valid, name: "Ana", email: "not-an-email", consent: { storeResults: true, policyVersion: "v1" } }).success).toBe(false);
  });
  it("WhatsApp is optional, normalised to E.164 and needs its own consent", () => {
    const req = { ...valid, name: "Ana", email: "a@b.co" };
    const plain = emailRequestSchema.safeParse({ ...req, consent: { storeResults: true, policyVersion: "v1" } });
    expect(plain.success && plain.data.consent.whatsapp).toBe(false);
    const ok = emailRequestSchema.safeParse({ ...req, whatsapp: "+34 600-00 (00) 00", consent: { storeResults: true, whatsapp: true, policyVersion: "v1" } });
    expect(ok.success && ok.data.whatsapp).toBe("+34600000000");
    expect(emailRequestSchema.safeParse({ ...req, whatsapp: "+34600000000", consent: { storeResults: true, policyVersion: "v1" } }).success).toBe(false);
    expect(emailRequestSchema.safeParse({ ...req, whatsapp: "600000000", consent: { storeResults: true, whatsapp: true, policyVersion: "v1" } }).success).toBe(false);
  });
  it("normalises and checks WhatsApp numbers", () => {
    expect(normalizeWhatsApp(" 0034 600 000 000 ")).toBe("+34600000000");
    expect(isWhatsAppNumber("+44 7700 900123")).toBe(true);
    expect(isWhatsAppNumber("+0 1234 5678")).toBe(false);
    expect(isWhatsAppNumber("+1234567")).toBe(false);
    expect(isWhatsAppNumber("+1234567890123456")).toBe(false);
  });
  it("admin WhatsApp reply and conversation id (never a number)", () => {
    const id = "6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f5a";
    expect(whatsappReplySchema.safeParse({ conversationId: id, body: "  Thanks  " })).toMatchObject({ success: true, data: { body: "Thanks" } });
    expect(whatsappReplySchema.safeParse({ conversationId: id, body: "   " }).success).toBe(false);
    expect(whatsappReplySchema.safeParse({ conversationId: "+34600000000", body: "x" }).success).toBe(false);
    expect(whatsappReplySchema.safeParse({ conversationId: id, body: "x".repeat(4097) }).success).toBe(false);
    expect(whatsappConversationIdSchema.safeParse(id).success).toBe(true);
    expect(whatsappConversationIdSchema.safeParse("34600000000").success).toBe(false);
  });

  it("cleans the name everywhere it is printed: letters only, no links or numbers, capped at 60", () => {
    expect(cleanDisplayName("  Ana-María   O'Neil ")).toBe("Ana-María O'Neil");
    expect(cleanDisplayName("Şükrü Çağlar")).toBe("Şükrü Çağlar");
    expect(cleanDisplayName("Win at https://evil.example/x?y=1")).toBe("Win at httpsevilexamplexy");
    expect(cleanDisplayName("call +44 7700 900123 now")).toBe("call now");
    expect(cleanDisplayName("A".repeat(80))).toHaveLength(60);
    expect(cleanDisplayName("123 !!")).toBeNull();
    const req = { ...valid, email: "a@b.co", consent: { storeResults: true, policyVersion: "v1" } };
    expect(emailRequestSchema.safeParse({ ...req, name: " Ana <b>x</b> " })).toMatchObject({ success: true, data: { name: "Ana bxb" } });
    expect(emailRequestSchema.safeParse({ ...req, name: "0800 123" }).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ ...valid, name: "0800" })).toMatchObject({ success: true, data: { name: undefined } });
  });
});
