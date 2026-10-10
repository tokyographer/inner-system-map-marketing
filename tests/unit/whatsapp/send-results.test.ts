import { describe, expect, it, vi } from "vitest";
import { LOCALES, WHATSAPP_INBOX_READY, WHATSAPP_RESULTS_READY, WHATSAPP_TEMPLATE_APPROVED, WHATSAPP_TEMPLATE_LANGUAGE } from "@/config/app";
import { PRIVACY } from "@/content/legal/privacy";
import { DEFAULT_TEMPLATE, GRAPH_API, readWhatsAppEnv, recipientKey, sendResultsWhatsApp, templateLanguage, templateName } from "@/lib/whatsapp/send-results";

const env = { token: "tok", phoneNumberId: "111", template: "inner_system_map_results" };
const args = { to: "+34600000000", name: "Ana", locale: "es" as const, pdf: Buffer.from("%PDF-fake") };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function fakeFetch(...responses: Response[]) {
  const fn = vi.fn<typeof fetch>();
  for (const r of responses) fn.mockResolvedValueOnce(r);
  return fn;
}

describe("readWhatsAppEnv", () => {
  it("is null until the token and phone number id are both set", () => {
    expect(readWhatsAppEnv({} as NodeJS.ProcessEnv)).toBeNull();
    expect(readWhatsAppEnv({ WHATSAPP_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: " " } as unknown as NodeJS.ProcessEnv)).toBeNull();
  });
  it("defaults the template name", () => {
    expect(readWhatsAppEnv({ WHATSAPP_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: "1" } as unknown as NodeJS.ProcessEnv)).toEqual({ token: "t", phoneNumberId: "1", template: DEFAULT_TEMPLATE });
    expect(readWhatsAppEnv({ WHATSAPP_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: "1", WHATSAPP_TEMPLATE: "other" } as unknown as NodeJS.ProcessEnv)?.template).toBe("other");
  });
});

describe("sendResultsWhatsApp", () => {
  it("uploads the PDF, then sends the template in the person's language with the PDF and their name", async () => {
    const fetchImpl = fakeFetch(json(200, { id: "media-1" }), json(200, { messages: [{ id: "wamid.1" }] }));
    expect(await sendResultsWhatsApp(args, env, fetchImpl)).toEqual({ messageId: "wamid.1" });

    const [uploadUrl, upload] = fetchImpl.mock.calls[0];
    expect(uploadUrl).toBe(`${GRAPH_API}/111/media`);
    expect(upload?.headers).toEqual({ Authorization: "Bearer tok" });
    const form = upload?.body as FormData;
    expect(form.get("messaging_product")).toBe("whatsapp");
    expect(form.get("type")).toBe("application/pdf");
    expect((form.get("file") as File).name).toBe("mapa-del-sistema-interno-results-ana.pdf");

    const [sendUrl, send] = fetchImpl.mock.calls[1];
    expect(sendUrl).toBe(`${GRAPH_API}/111/messages`);
    expect(JSON.parse(String(send?.body))).toEqual({
      messaging_product: "whatsapp",
      to: "34600000000",
      type: "template",
      template: {
        name: "inner_system_map_results",
        language: { code: "en" },
        components: [
          { type: "header", parameters: [{ type: "document", document: { id: "media-1", filename: "mapa-del-sistema-interno-results-ana.pdf" } }] },
          { type: "body", parameters: [{ type: "text", text: "Ana" }] },
        ],
      },
    });
  });
  it("reports Meta's numeric code, never its message or the number", async () => {
    const leaky = { error: { code: 131030, message: "Recipient +34600000000 not in allowed list" } };
    const err = await sendResultsWhatsApp(args, env, fakeFetch(json(200, { id: "m" }), json(400, leaky))).catch((e: Error) => e);
    expect(String(err)).toContain("send failed (HTTP 400, code 131030)");
    expect(String(err)).not.toContain("34600000000");
    await expect(sendResultsWhatsApp(args, env, fakeFetch(new Response("<html>", { status: 502 })))).rejects.toThrow("upload failed (HTTP 502, code unknown)");
  });
  it("tolerates a success reply without a message id", async () => {
    expect(await sendResultsWhatsApp(args, env, fakeFetch(json(200, { id: "m" }), json(200, {})))).toEqual({ messageId: "" });
  });
});

describe("templateName and recipientKey", () => {
  it("keeps only letters, spaces, apostrophes and hyphens, capped at 60", () => {
    expect(templateName("  Ana-María   O'Neil ")).toBe("Ana-María O'Neil");
    expect(templateName("Şükrü Çağlar")).toBe("Şükrü Çağlar");
    expect(templateName("Win at https://evil.example/x?y=1")).toBe("Win at httpsevilexamplexy");
    expect(templateName("A".repeat(80))).toHaveLength(60);
    expect(templateName("123 !!")).toBeNull();
  });
  it("hashes the number for the rate-limit key", () => {
    expect(recipientKey("+34600000000")).toMatch(/^wa:[0-9a-f]{64}$/);
    expect(recipientKey("+34600000000")).not.toContain("34600000000");
  });
  it("skips the send without calling Meta when the name has no letters", async () => {
    const fetchImpl = fakeFetch();
    await expect(sendResultsWhatsApp({ ...args, name: "1234" }, env, fetchImpl)).rejects.toThrow("name has no letters");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("WhatsApp config and privacy notice", () => {
  it("requests the person's own template language only once it is approved, otherwise English", () => {
    expect(templateLanguage("es", ["en"])).toBe("en");
    expect(templateLanguage("tr", ["en", "es"])).toBe("en");
    expect(templateLanguage("es", ["en", "es"])).toBe("es");
    expect(templateLanguage("en", [])).toBe("en");
    expect(WHATSAPP_TEMPLATE_APPROVED).toContain("en");
    for (const l of WHATSAPP_TEMPLATE_APPROVED) expect(LOCALES).toContain(l);
  });
  it("has a template language for every locale", () => {
    expect(Object.keys(WHATSAPP_TEMPLATE_LANGUAGE).sort()).toEqual([...LOCALES].sort());
  });
  it("mentions WhatsApp in the privacy notice exactly when a WhatsApp feature is on", () => {
    for (const locale of LOCALES) {
      const text = JSON.stringify(PRIVACY[locale]);
      expect(text.includes("WhatsApp")).toBe(WHATSAPP_RESULTS_READY || WHATSAPP_INBOX_READY);
    }
  });
});
