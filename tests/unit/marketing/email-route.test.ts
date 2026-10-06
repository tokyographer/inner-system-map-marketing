import { beforeEach, describe, expect, it, vi } from "vitest";
import { build } from "../scoring/helpers";

const send = vi.fn();
vi.mock("@/lib/email/send-results", () => ({ readEmailEnv: () => ({ apiKey: "k", from: "f", copyTo: "inbox@example.test" }), sendResultsEmail: (...a: unknown[]) => send(...a) }));
vi.mock("@/lib/pdf/render", () => ({ renderResultsPdf: async () => Buffer.from("pdf") }));
vi.mock("@/lib/db", () => ({ dbConfigured: () => false }));
vi.mock("@/marketing/config", async (orig) => ({ ...(await orig<typeof import("@/marketing/config")>()), LIVE_SESSION_URL: { en: "https://example.org/live", es: "", ro: "", tr: "" } }));
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string, v: { url: string }) => `${key} ${v.url}` }));

const { POST } = await import("@/app/api/public/email-results/route");

let ip = 0;
const body = (extra: Record<string, unknown>) => ({
  locale: "en", form: "short", responses: build("short", {}, 3), ageConfirmed: true, name: "Test Person", email: "person@example.test",
  consent: { storeResults: true, newsletter: false, policyVersion: "2026-09-draft+m2026-10-draft" }, ...extra,
});
const post = (b: unknown) => POST(new Request("http://x.test/api/public/email-results", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `10.1.0.${++ip}` }, body: JSON.stringify(b) }));

beforeEach(() => send.mockReset());

describe("email-results route, marketing additions", () => {
  it("adds the attribution to the institute copy; without a database a partner code cannot be checked, so it is left out", async () => {
    const res = await post(body({ attribution: { utmSource: "newsletter", utmMedium: "email", ref: "studio-om" } }));
    expect(res.status).toBe(200);
    const args = send.mock.calls[0][0];
    expect(args.instituteDetails).toEqual([{ label: "Source", value: "newsletter" }, { label: "Medium", value: "email" }]);
    expect(args.personFooter).toBeUndefined(); // did not opt in
  });

  it("adds the live-session line only for people who opted in, and passes flooded so the core can drop it", async () => {
    const optIn = { consent: { storeResults: true, newsletter: true, policyVersion: "2026-09-draft+m2026-10-draft" } };
    await post(body(optIn));
    expect(send.mock.calls[0][0].personFooter).toMatch(/^liveSession https:\/\/example\.org\/live\?utm_source=inner-system-map/);
    expect(send.mock.calls[0][0].flooded).toBe(false);
    const exiles = ["SHAM", "ABAN", "FEAR", "POWL", "LONE"];
    const responses = Object.fromEntries(Object.keys(build("short", {}, 3)).map((id) => [id, exiles.some((e) => id.startsWith(e)) ? 5 : id.startsWith("SELF") ? 1 : 3]));
    await post({ ...body(optIn), responses });
    expect(send.mock.calls[1][0].flooded).toBe(true);
  });

  it("sends no details when there is no attribution, and invalid attribution never fails the email", async () => {
    expect((await post(body({}))).status).toBe(200);
    expect(send.mock.calls[0][0].instituteDetails).toEqual([]);
    expect((await post(body({ attribution: { utmSource: "Not A Slug" } }))).status).toBe(200);
    expect(send.mock.calls[1][0].instituteDetails).toEqual([]);
  });
});
