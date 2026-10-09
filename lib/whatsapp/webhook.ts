/**
 * Meta WhatsApp webhook helpers: the GET verification handshake, the X-Hub-Signature-256 check
 * over the raw body, and a defensive parse of the payload into inbound messages and delivery
 * statuses. Pure functions, no I/O. Media is never downloaded; only its kind and caption are kept.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_BODY = 4096;
export const MAX_PROFILE_NAME = 120;
export type DeliveryStatus = "sent" | "delivered" | "read" | "failed";
const STATUSES: DeliveryStatus[] = ["sent", "delivered", "read", "failed"];

export interface InboundMessage {
  waMessageId: string;
  /** E.164 with the leading +. */
  number: string;
  kind: string;
  body: string | null;
  profileName: string | null;
}

export interface StatusUpdate {
  waMessageId: string;
  status: DeliveryStatus;
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Returns the challenge to echo when Meta's subscribe handshake carries our verify token, else null. */
export function verifyChallenge(params: URLSearchParams, verifyToken: string): string | null {
  const token = params.get("hub.verify_token") ?? "";
  const challenge = params.get("hub.challenge");
  if (params.get("hub.mode") !== "subscribe" || !challenge || !safeEqual(token, verifyToken)) return null;
  return challenge;
}

/** Checks Meta's `sha256=<hex>` HMAC of the raw request body with the app secret. */
export function verifySignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex")}`;
  return safeEqual(header, expected);
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const clip = (v: string | null, max: number): string | null => (v === null ? null : v.slice(0, max));

function messageBody(m: Obj, kind: string): string | null {
  const part = isObj(m[kind]) ? (m[kind] as Obj) : {};
  if (kind === "text") return str(part.body);
  if (kind === "button") return str(part.text);
  if (kind === "interactive") {
    const reply = isObj(part.button_reply) ? part.button_reply : isObj(part.list_reply) ? part.list_reply : {};
    return str((reply as Obj).title);
  }
  return str(part.caption);
}

/** Inbound messages and statuses for our phone number only; anything malformed is skipped. */
export function parseWebhook(payload: unknown, phoneNumberId: string): { inbound: InboundMessage[]; statuses: StatusUpdate[] } {
  const inbound: InboundMessage[] = [];
  const statuses: StatusUpdate[] = [];
  if (!isObj(payload)) return { inbound, statuses };
  for (const entry of arr(payload.entry)) {
    for (const change of arr(isObj(entry) ? entry.changes : null)) {
      if (!isObj(change) || change.field !== "messages" || !isObj(change.value)) continue;
      const value = change.value;
      if (!isObj(value.metadata) || value.metadata.phone_number_id !== phoneNumberId) continue;
      const names = new Map<string, string>();
      for (const c of arr(value.contacts)) {
        const name = isObj(c) && isObj(c.profile) ? str(c.profile.name) : null;
        const waId = isObj(c) ? str(c.wa_id) : null;
        if (name && waId) names.set(waId, name);
      }
      for (const m of arr(value.messages)) {
        if (!isObj(m)) continue;
        const from = str(m.from);
        const id = str(m.id);
        if (!from || !/^[1-9]\d{7,14}$/.test(from) || !id || id.length > 200) continue;
        const rawKind = str(m.type) ?? "unknown";
        const kind = /^[a-z_]{1,30}$/.test(rawKind) ? rawKind : "unknown";
        inbound.push({ waMessageId: id, number: `+${from}`, kind, body: clip(messageBody(m, kind), MAX_BODY), profileName: clip(names.get(from) ?? null, MAX_PROFILE_NAME) });
      }
      for (const s of arr(value.statuses)) {
        if (!isObj(s)) continue;
        const id = str(s.id);
        const status = STATUSES.find((x) => x === s.status);
        if (id && id.length <= 200 && status) statuses.push({ waMessageId: id, status });
      }
    }
  }
  return { inbound, statuses };
}

/** The free-reply window: open for 24 hours after the person's last message. */
export const REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

export function replyWindowLeftMs(lastInboundAt: Date | null, now: Date = new Date()): number {
  if (!lastInboundAt) return 0;
  return Math.max(0, lastInboundAt.getTime() + REPLY_WINDOW_MS - now.getTime());
}
