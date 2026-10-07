import { describe, expect, it, vi } from "vitest";
import type { Resend } from "resend";
import { LOCALES, PUBLIC_RESULTS_RETENTION_MONTHS } from "@/config/app";
import { getContent } from "@/content";
import { readEmailEnv, sendResultsEmail } from "@/lib/email/send-results";

function fakeResend(fail?: "first" | "second", error: Record<string, unknown> = { message: "boom" }) {
  const send = vi.fn()
    .mockResolvedValueOnce(fail === "first" ? { data: null, error } : { data: { id: "u1" }, error: null })
    .mockResolvedValueOnce(fail === "second" ? { data: null, error } : { data: { id: "c1" }, error: null });
  return { client: { emails: { send } } as unknown as Resend, send };
}

const base = { to: "person@example.com", locale: "en" as const, pdf: Buffer.from("%PDF-fake"), patternTitle: "Managers are leading", flooded: false };
const env = { apiKey: "k", from: "Map <results@example.com>", copyTo: "info@transcendentinstitute.com" };

describe("readEmailEnv", () => {
  it("throws an actionable error when unset", () => {
    expect(() => readEmailEnv({} as NodeJS.ProcessEnv)).toThrow(/RESEND_API_KEY/);
  });
  it("treats empty RESULTS_COPY_TO as disabled", () => {
    expect(readEmailEnv({ RESEND_API_KEY: "k", RESEND_FROM: "f", RESULTS_COPY_TO: "  " } as unknown as NodeJS.ProcessEnv).copyTo).toBeNull();
  });
});

describe("sendResultsEmail", () => {
  it("sends to the person and a separate copy to the institute with the PDF attached", async () => {
    const { client, send } = fakeResend();
    const ids = await sendResultsEmail(base, env, client);
    expect(ids).toEqual({ userId: "u1", copyId: "c1" });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].to).toEqual(["person@example.com"]);
    expect(send.mock.calls[1][0].to).toEqual(["info@transcendentinstitute.com"]);
    for (const call of send.mock.calls) {
      expect(call[0].attachments[0].filename).toMatch(/\.pdf$/);
      expect(call[0].attachments[0].content).toBe(base.pdf);
      expect(call[0].bcc).toBeUndefined();
    }
  });
  it("skips the institute copy when RESULTS_COPY_TO is empty", async () => {
    const { client, send } = fakeResend();
    const ids = await sendResultsEmail(base, { ...env, copyTo: null }, client);
    expect(ids.copyId).toBeNull();
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("flags FLOODED in the institute copy only", async () => {
    const { client, send } = fakeResend();
    await sendResultsEmail({ ...base, flooded: true }, env, client);
    expect(send.mock.calls[0][0].text).not.toContain("FLOODED");
    expect(send.mock.calls[1][0].text).toContain("FLOODED");
  });
  it("writes the person's email in their locale and keeps the institute copy in English", async () => {
    const { client, send } = fakeResend();
    const institutePdf = Buffer.from("%PDF-english");
    await sendResultsEmail({ ...base, locale: "es", name: "Ana", deleteUrl: "https://example.com/del?token=t", institutePdf }, env, client);
    const [person, institute] = send.mock.calls.map((c) => c[0]);
    expect(person.attachments).toEqual([{ filename: "mapa-del-sistema-interno-results-ana.pdf", content: base.pdf }]);
    expect(institute.attachments).toEqual([{ filename: "inner-system-map-results-ana.pdf", content: institutePdf }]);
    expect(person.subject).toBe("Tus resultados del Mapa del Sistema Interno");
    expect(person.text).toContain("Hola, Ana:");
    expect(person.text).toContain(getContent("es").careNote);
    expect(person.text).toContain(`durante ${PUBLIC_RESULTS_RETENTION_MONTHS} meses`);
    expect(person.text).toContain("https://example.com/del?token=t");
    expect(person.text).not.toMatch(/\{\w+\}/);
    expect(institute.subject).toBe("[Inner System Map] New results (Managers are leading)");
    expect(institute.text).toContain("Language: es");
  });
  it("refuses to send anything when the institute copy would lack an English PDF", async () => {
    const { client, send } = fakeResend();
    await expect(sendResultsEmail({ ...base, locale: "tr" }, env, client)).rejects.toThrow(/English PDF/);
    expect(send).not.toHaveBeenCalled();
  });
  it("needs no separate English PDF when the copy is disabled or the person used English", async () => {
    const { client, send } = fakeResend();
    await sendResultsEmail({ ...base, locale: "ro" }, { ...env, copyTo: null }, client);
    expect(send).toHaveBeenCalledTimes(1);
    const en = fakeResend();
    await sendResultsEmail(base, env, en.client);
    expect(en.send.mock.calls[1][0].attachments[0].content).toBe(base.pdf);
  });
  it("has no leftover placeholders in any locale, with or without a name and delete link", async () => {
    for (const locale of LOCALES) {
      for (const extra of [{}, { name: "Ana", deleteUrl: "https://example.com/d" }]) {
        const { client, send } = fakeResend();
        await sendResultsEmail({ ...base, locale, ...extra }, { ...env, copyTo: null }, client);
        const { subject, text } = send.mock.calls[0][0];
        expect(`${subject}\n${text}`).not.toMatch(/\{\w+\}/);
        expect(text).toContain(getContent(locale).careNote);
      }
    }
  });
  it("keeps both bodies byte-identical when no optional extras are passed", async () => {
    for (const flooded of [false, true]) {
      const { client, send } = fakeResend();
      await sendResultsEmail({ ...base, flooded, name: "Ana", deleteUrl: "https://example.com/d" }, env, client);
      expect(send.mock.calls.map((c) => c[0].text)).toMatchSnapshot();
    }
  });
  it("adds instituteDetails to the institute copy only, one line each, dropping empty entries", async () => {
    const { client, send } = fakeResend();
    const instituteDetails = [
      { label: "Source", value: "webinar\r\nspring" },
      { label: "  ", value: "dropped-label" },
      { label: "Empty", value: "\n" },
      { label: "Long", value: "x".repeat(200) },
    ];
    await sendResultsEmail({ ...base, flooded: true, instituteDetails }, env, client);
    const [person, institute] = send.mock.calls.map((c) => c[0].text as string);
    expect(institute.endsWith(`FLOODED. May benefit from extra support.\nSource: webinar spring\nLong: ${"x".repeat(120)}`)).toBe(true);
    expect(institute).not.toContain("dropped-label");
    expect(institute).not.toContain("Empty:");
    expect(person).not.toContain("Source");
  });
  it("ends the person's text with personFooter, never in the institute copy", async () => {
    const { client, send } = fakeResend();
    await sendResultsEmail({ ...base, locale: "es", institutePdf: base.pdf, personFooter: "  Línea uno\r\nLínea dos  " }, env, client);
    const [person, institute] = send.mock.calls.map((c) => c[0].text as string);
    expect(person.endsWith(`${getContent("es").email.keptReplyToDelete}\n\nLínea uno\nLínea dos`)).toBe(true);
    expect(person).not.toContain("\r");
    expect(institute).not.toContain("Línea");
  });
  it("cuts personFooter at 500 characters and treats blank input as no footer", async () => {
    const long = fakeResend();
    await sendResultsEmail({ ...base, personFooter: "y".repeat(800) }, env, long.client);
    expect(long.send.mock.calls[0][0].text.endsWith(`\n\n${"y".repeat(500)}`)).toBe(true);
    expect(long.send.mock.calls[0][0].text).not.toContain("y".repeat(501));
    const blank = fakeResend();
    await sendResultsEmail({ ...base, personFooter: " \r\n " }, env, blank.client);
    expect(blank.send.mock.calls[0][0].text.endsWith(getContent("en").email.keptReplyToDelete)).toBe(true);
  });
  it("drops personFooter when the pattern is FLOODED", async () => {
    const { client, send } = fakeResend();
    await sendResultsEmail({ ...base, flooded: true, personFooter: "Join our next live session." }, env, client);
    for (const call of send.mock.calls) expect(call[0].text).not.toContain("live session");
  });
  it("surfaces provider errors", async () => {
    await expect(sendResultsEmail(base, env, fakeResend("first").client)).rejects.toThrow(/participant failed \(unknown\)/);
    await expect(sendResultsEmail(base, env, fakeResend("second").client)).rejects.toThrow(/institute failed \(unknown\)/);
  });

  it("never puts the provider's message (which may echo an address) in the error, only its error name", async () => {
    const error = { name: "validation_error", message: "Invalid `to` field: person@example.com" };
    for (const fail of ["first", "second"] as const) {
      const thrown = await sendResultsEmail(base, env, fakeResend(fail, error).client).catch((e: Error) => e);
      expect(thrown).toBeInstanceOf(Error);
      expect((thrown as Error).message).toContain("(validation_error)");
      expect((thrown as Error).message).not.toContain("person@example.com");
      expect((thrown as Error).message).not.toContain("Invalid");
    }
    const odd = await sendResultsEmail(base, env, fakeResend("first", { name: "Bad Name person@example.com", message: "x" }).client).catch((e: Error) => e);
    expect((odd as Error).message).toBe("Email to participant failed (unknown)");
  });
});
