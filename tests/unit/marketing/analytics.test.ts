import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.fn();
vi.mock("@vercel/analytics", () => ({ track: (...args: unknown[]) => track(...args) }));

const { FUNNEL_EVENTS, analyticsBeforeSend, eventProps, sanitizeUrl, trackFunnel } = await import("@/marketing/analytics");
const { funnel } = await import("@/marketing/funnel");
const { captureAttribution, resetPendingAttribution } = await import("@/marketing/attribution");

beforeEach(() => { vi.stubGlobal("window", {}); });
afterEach(() => { track.mockReset(); vi.unstubAllGlobals(); resetPendingAttribution(); });

describe("funnel analytics", () => {
  it("has exactly the five funnel events", () => {
    expect(FUNNEL_EVENTS).toEqual(["landing_view", "start", "completion", "email_sent", "invite_click"]);
  });

  it("sends only locale and target, whatever the caller passes (no partner code)", () => {
    const sneaky = { locale: "en", ref: "studio-om", target: "program", email: "a@b.c", pattern: "FLOODED", score: 4.2 } as never;
    expect(eventProps(sneaky)).toEqual({ locale: "en", target: "program" });
    trackFunnel("start", sneaky);
    expect(track).toHaveBeenCalledWith("start", { locale: "en", target: "program" });
  });

  it("creates the analytics queue before <Analytics> hydrates, with the URL sanitiser first", () => {
    trackFunnel("landing_view", { locale: "en" });
    const w = window as unknown as { va: (...p: unknown[]) => void; vaq?: unknown[][] };
    w.va("event", { name: "x" });
    expect(w.vaq).toEqual([["beforeSend", analyticsBeforeSend], ["event", { name: "x" }]]);
  });

  it("never throws when analytics fails", () => {
    track.mockImplementation(() => { throw new Error("blocked"); });
    expect(() => trackFunnel("completion", { locale: "en" })).not.toThrow();
  });

  it("funnel() adds the page locale, never the partner code, and does nothing on the server", () => {
    funnel("start");
    expect(track).not.toHaveBeenCalled();
    vi.stubGlobal("document", { documentElement: { lang: "ro" } });
    funnel("landing_view");
    expect(track).toHaveBeenLastCalledWith("landing_view", { locale: "ro" });
    captureAttribution("?ref=studio-om&utm_source=newsletter");
    funnel("invite_click", { target: "live_session" });
    expect(track).toHaveBeenLastCalledWith("invite_click", { locale: "ro", target: "live_session" });
  });
});

describe("sanitizeUrl", () => {
  it("keeps the path and the validated utm parameters only (no partner code, no other parameter)", () => {
    expect(sanitizeUrl("https://x.test/en?ref=Studio-Om&token=secret&utm_source=nl&mc_eid=abc#frag")).toBe("https://x.test/en?utm_source=nl");
    expect(sanitizeUrl("https://x.test/en/results")).toBe("https://x.test/en/results");
    expect(sanitizeUrl("https://x.test/tr/start/")).toBe("https://x.test/tr/start/");
  });

  it("drops utm values that could carry a name or an email", () => {
    expect(sanitizeUrl("https://x.test/en?utm_source=jane.doe@gmail.com&utm_campaign=Jane%20Doe&utm_medium=email")).toBe("https://x.test/en?utm_medium=email");
  });

  it("sends nothing for cohort, facilitator, admin or unknown pages, or a bad URL", () => {
    for (const path of ["/en/cohort/results/0b6f", "/en/facilitator/cohorts/1/participants/2", "/en/admin/cohorts/1", "/en/cohort", "/de", "/"]) {
      expect(sanitizeUrl(`https://x.test${path}`), path).toBeNull();
    }
    expect(sanitizeUrl("not a url")).toBeNull();
  });

  it("analyticsBeforeSend rewrites the URL or drops the event", () => {
    expect(analyticsBeforeSend({ type: "pageview", url: "https://x.test/en?email=a@b.c" })).toEqual({ type: "pageview", url: "https://x.test/en" });
    expect(analyticsBeforeSend({ type: "event", url: "https://x.test/en/admin/audit" })).toBeNull();
  });
});

describe("funnel counts", () => {
  it("posts starts and completions (with the partner code) to the counter, nothing else", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", { documentElement: { lang: "en" } });
    captureAttribution("?ref=studio-om");
    funnel("start");
    funnel("completion");
    funnel("landing_view");
    funnel("email_sent");
    funnel("invite_click", { target: "program" });
    expect(fetchMock.mock.calls.map(([url, init]) => [url, JSON.parse(init.body), init.keepalive])).toEqual([
      ["/api/marketing/funnel", { event: "start", ref: "studio-om" }, true],
      ["/api/marketing/funnel", { event: "complete", ref: "studio-om" }, true],
    ]);
  });
});
