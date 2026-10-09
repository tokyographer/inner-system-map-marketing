/**
 * Sends the results PDF to the person on WhatsApp (Meta Cloud API), only when they gave a number
 * and ticked the WhatsApp consent. Uploads the PDF, then sends the approved Utility template in
 * their locale with the PDF as the document header and their name as {{1}}.
 * Never logs or echoes the number, the name or Meta's error message; errors carry Meta's numeric code only.
 */
import { createHash } from "node:crypto";
import { WHATSAPP_TEMPLATE_LANGUAGE, type Locale } from "@/config/app";
import { resultsPdfFilename } from "@/lib/pdf/filename";

export const GRAPH_API = "https://graph.facebook.com/v21.0";
export const DEFAULT_TEMPLATE = "inner_system_map_results";

export interface WhatsAppEnv {
  token: string;
  phoneNumberId: string;
  template: string;
}

export interface SendWhatsAppArgs {
  /** E.164, already validated (`+` and 8–15 digits). */
  to: string;
  name: string;
  locale: Locale;
  /** Results PDF in the person's locale. */
  pdf: Buffer;
}

/** Null when WhatsApp is not configured; callers then skip the send. */
export function readWhatsAppEnv(env: NodeJS.ProcessEnv = process.env): WhatsAppEnv | null {
  const token = env.WHATSAPP_TOKEN?.trim();
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneNumberId) return null;
  return { token, phoneNumberId, template: env.WHATSAPP_TEMPLATE?.trim() || DEFAULT_TEMPLATE };
}

/**
 * The template's {{1}}: letters, spaces, apostrophes and hyphens only, at most 60 characters, so a
 * caller cannot put a link or other text into a message from the institute's number. Null when
 * nothing usable is left; callers then skip the WhatsApp send.
 */
export function templateName(name: string): string | null {
  const clean = name.replace(/[^\p{L}\p{M}\s'’-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60).trim();
  return /\p{L}/u.test(clean) ? clean : null;
}

/** Rate-limit key for one recipient: a hash, so no plain number is stored in Redis. */
export function recipientKey(to: string): string {
  return `wa:${createHash("sha256").update(to).digest("hex")}`;
}

type Fetch = typeof fetch;

export async function graphError(res: Response, step: string): Promise<Error> {
  let code = "unknown";
  try {
    const body = (await res.json()) as { error?: { code?: unknown } };
    if (typeof body.error?.code === "number") code = String(body.error.code);
  } catch { /* non-JSON body: keep "unknown" */ }
  return new Error(`WhatsApp ${step} failed (HTTP ${res.status}, code ${code})`);
}

export async function sendResultsWhatsApp(args: SendWhatsAppArgs, env: WhatsAppEnv, fetchImpl: Fetch = fetch): Promise<{ messageId: string }> {
  const greetingName = templateName(args.name);
  if (!greetingName) throw new Error("WhatsApp send skipped (name has no letters)");
  const headers = { Authorization: `Bearer ${env.token}` };
  const filename = resultsPdfFilename(args.locale, args.name);

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([new Uint8Array(args.pdf)], { type: "application/pdf" }), filename);
  const upload = await fetchImpl(`${GRAPH_API}/${env.phoneNumberId}/media`, { method: "POST", headers, body: form });
  if (!upload.ok) throw await graphError(upload, "upload");
  const { id: mediaId } = (await upload.json()) as { id: string };

  const send = await fetchImpl(`${GRAPH_API}/${env.phoneNumberId}/messages`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: args.to.replace(/^\+/, ""),
      type: "template",
      template: {
        name: env.template,
        language: { code: WHATSAPP_TEMPLATE_LANGUAGE[args.locale] },
        components: [
          { type: "header", parameters: [{ type: "document", document: { id: mediaId, filename } }] },
          { type: "body", parameters: [{ type: "text", text: greetingName }] },
        ],
      },
    }),
  });
  if (!send.ok) throw await graphError(send, "send");
  const sent = (await send.json()) as { messages?: { id?: string }[] };
  return { messageId: sent.messages?.[0]?.id ?? "" };
}
