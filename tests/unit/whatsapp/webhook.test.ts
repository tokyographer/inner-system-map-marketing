import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { readWebhookEnv, sendTextReply } from "@/lib/whatsapp/reply";
import { GRAPH_API } from "@/lib/whatsapp/send-results";
import { parseWebhook, REPLY_WINDOW_MS, replyWindowLeftMs, verifyChallenge, verifySignature } from "@/lib/whatsapp/webhook";

const PHONE = "111";
const sign = (body: string, secret = "s3cret") => `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

function payload(value: Record<string, unknown>, field = "messages") {
  return { object: "whatsapp_business_account", entry: [{ id: "waba", changes: [{ field, value: { messaging_product: "whatsapp", metadata: { phone_number_id: PHONE }, ...value } }] }] };
}

describe("verifyChallenge", () => {
  const q = (o: Record<string, string>) => new URLSearchParams(o);
  it("echoes the challenge only for a subscribe with our token", () => {
    expect(verifyChallenge(q({ "hub.mode": "subscribe", "hub.verify_token": "tok", "hub.challenge": "42" }), "tok")).toBe("42");
    expect(verifyChallenge(q({ "hub.mode": "subscribe", "hub.verify_token": "nope", "hub.challenge": "42" }), "tok")).toBeNull();
    expect(verifyChallenge(q({ "hub.mode": "unsubscribe", "hub.verify_token": "tok", "hub.challenge": "42" }), "tok")).toBeNull();
    expect(verifyChallenge(q({ "hub.mode": "subscribe", "hub.verify_token": "tok" }), "tok")).toBeNull();
    expect(verifyChallenge(q({}), "tok")).toBeNull();
  });
});

describe("verifySignature", () => {
  it("accepts Meta's HMAC of the exact raw body and nothing else", () => {
    const body = JSON.stringify({ a: "é" });
    expect(verifySignature(body, sign(body), "s3cret")).toBe(true);
    expect(verifySignature(`${body} `, sign(body), "s3cret")).toBe(false);
    expect(verifySignature(body, sign(body, "other"), "s3cret")).toBe(false);
    expect(verifySignature(body, sign(body).replace("sha256=", "sha1="), "s3cret")).toBe(false);
    expect(verifySignature(body, null, "s3cret")).toBe(false);
  });
});

describe("parseWebhook", () => {
  it("reads text, captions, buttons and interactive replies with the profile name, for our number only", () => {
    const p = payload({
      contacts: [{ profile: { name: "Ana" }, wa_id: "34600000000" }],
      messages: [
        { from: "34600000000", id: "w1", type: "text", text: { body: "Hola" } },
        { from: "34600000000", id: "w2", type: "image", image: { caption: "my map", id: "media" } },
        { from: "34600000000", id: "w3", type: "audio", audio: { id: "media" } },
        { from: "34600000000", id: "w4", type: "button", button: { text: "Yes" } },
        { from: "34600000000", id: "w5", type: "interactive", interactive: { list_reply: { title: "Option" } } },
        { from: "34600000000", id: "w6", type: "interactive", interactive: { button_reply: { title: "Ok" } } },
        { from: "34600000000", id: "w7", type: "Weird-Type!" },
        { from: "44770090012", id: "w8", type: "text", text: { body: "x".repeat(5000) } },
      ],
    });
    const { inbound } = parseWebhook(p, PHONE);
    expect(inbound.map((m) => [m.waMessageId, m.kind, m.body])).toEqual([
      ["w1", "text", "Hola"], ["w2", "image", "my map"], ["w3", "audio", null], ["w4", "button", "Yes"],
      ["w5", "interactive", "Option"], ["w6", "interactive", "Ok"], ["w7", "unknown", null], ["w8", "text", "x".repeat(4096)],
    ]);
    expect(inbound[0]).toMatchObject({ number: "+34600000000", profileName: "Ana" });
    expect(inbound[7].profileName).toBeNull();
    expect(parseWebhook(p, "other-number").inbound).toEqual([]);
  });
  it("skips malformed messages, other fields and non-objects", () => {
    const p = payload({ messages: [{ from: "abc", id: "w1", type: "text" }, { from: "34600000000", type: "text" }, { from: "34600000000", id: "y".repeat(201) }, "junk"], contacts: ["junk", { wa_id: "1" }] });
    expect(parseWebhook(p, PHONE).inbound).toEqual([]);
    expect(parseWebhook(payload({ messages: [{ from: "34600000000", id: "w", type: "text" }] }, "account_update"), PHONE).inbound).toEqual([]);
    expect(parseWebhook(null, PHONE)).toEqual({ inbound: [], statuses: [] });
    expect(parseWebhook({ entry: ["x", { changes: ["x", { field: "messages", value: { metadata: "x" } }] }] }, PHONE)).toEqual({ inbound: [], statuses: [] });
  });
  it("reads delivery statuses and ignores unknown ones", () => {
    const p = payload({ statuses: [{ id: "o1", status: "delivered" }, { id: "o2", status: "read" }, { id: "o3", status: "deleted" }, { status: "sent" }, "junk"] });
    expect(parseWebhook(p, PHONE).statuses).toEqual([{ waMessageId: "o1", status: "delivered" }, { waMessageId: "o2", status: "read" }]);
  });
});

describe("replyWindowLeftMs", () => {
  it("is open for 24 hours after the last inbound message", () => {
    const now = new Date("2026-10-09T12:00:00Z");
    expect(replyWindowLeftMs(null, now)).toBe(0);
    expect(replyWindowLeftMs(new Date(now.getTime() - 3_600_000), now)).toBe(REPLY_WINDOW_MS - 3_600_000);
    expect(replyWindowLeftMs(new Date(now.getTime() - REPLY_WINDOW_MS - 1), now)).toBe(0);
  });
});

describe("replies", () => {
  it("reads the webhook secrets", () => {
    expect(readWebhookEnv({ WHATSAPP_APP_SECRET: "a" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(readWebhookEnv({ WHATSAPP_APP_SECRET: " a ", WHATSAPP_VERIFY_TOKEN: "v" } as unknown as NodeJS.ProcessEnv)).toEqual({ appSecret: "a", verifyToken: "v" });
  });
  it("sends plain text without link previews and reports Meta's code on failure", async () => {
    const env = { token: "tok", phoneNumberId: PHONE, template: "t" };
    const ok = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify({ messages: [{ id: "wamid.9" }] }), { status: 200 }));
    expect(await sendTextReply({ to: "+34600000000", body: "Thanks" }, env, ok)).toEqual({ messageId: "wamid.9" });
    expect(ok.mock.calls[0][0]).toBe(`${GRAPH_API}/${PHONE}/messages`);
    expect(JSON.parse(String(ok.mock.calls[0][1]?.body))).toEqual({ messaging_product: "whatsapp", to: "34600000000", type: "text", text: { body: "Thanks", preview_url: false } });
    const noId = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("{}", { status: 200 }));
    expect(await sendTextReply({ to: "+34600000000", body: "x" }, env, noId)).toEqual({ messageId: "" });
    const bad = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 131047, message: "+34600000000 window" } }), { status: 400 }));
    await expect(sendTextReply({ to: "+34600000000", body: "x" }, env, bad)).rejects.toThrow("reply failed (HTTP 400, code 131047)");
  });
});
