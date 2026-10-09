/**
 * Free-text replies from the admin inbox, allowed by WhatsApp only within 24 hours of the person's
 * last message. Also reads the webhook secrets. Never logs the number or the text.
 */
import { GRAPH_API, graphError, type WhatsAppEnv } from "./send-results";

export interface WebhookEnv {
  appSecret: string;
  verifyToken: string;
}

/** Null when the webhook is not configured; the route then refuses every call. */
export function readWebhookEnv(env: NodeJS.ProcessEnv = process.env): WebhookEnv | null {
  const appSecret = env.WHATSAPP_APP_SECRET?.trim();
  const verifyToken = env.WHATSAPP_VERIFY_TOKEN?.trim();
  return appSecret && verifyToken ? { appSecret, verifyToken } : null;
}

export async function sendTextReply(args: { to: string; body: string }, env: WhatsAppEnv, fetchImpl: typeof fetch = fetch): Promise<{ messageId: string }> {
  const res = await fetchImpl(`${GRAPH_API}/${env.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: args.to.replace(/^\+/, ""), type: "text", text: { body: args.body, preview_url: false } }),
  });
  if (!res.ok) throw await graphError(res, "reply");
  const sent = (await res.json()) as { messages?: { id?: string }[] };
  return { messageId: sent.messages?.[0]?.id ?? "" };
}
