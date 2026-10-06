import { describe, expect, it } from "vitest";
import { LIVE_SESSION_URL, PROGRAM_URL } from "@/marketing/config";
import { liveSessionUrl, partnerLink, programInviteUrl, withUtm } from "@/marketing/links";

describe("outbound links", () => {
  it("tags the program page per locale", () => {
    const url = new URL(programInviteUrl("ro", { ...PROGRAM_URL, ro: "https://example.org/ro/program?x=1" }));
    expect(url.pathname).toBe("/ro/program");
    expect(Object.fromEntries(url.searchParams)).toEqual({ x: "1", utm_source: "inner-system-map", utm_medium: "results", utm_campaign: "program-invite", utm_content: "ro" });
  });

  it("hides the live session when its URL is empty, tags it otherwise", () => {
    expect(liveSessionUrl("en", { ...LIVE_SESSION_URL, en: "" })).toBeNull();
    expect(liveSessionUrl("tr", { ...LIVE_SESSION_URL, tr: "https://example.org/live" })).toBe("https://example.org/live?utm_source=inner-system-map&utm_medium=results&utm_campaign=live-session&utm_content=tr");
  });

  it("every configured URL is absolute https", () => {
    for (const url of [...Object.values(PROGRAM_URL), ...Object.values(LIVE_SESSION_URL).filter(Boolean)]) expect(new URL(url).protocol).toBe("https:");
  });

  it("withUtm overrides existing utm values", () => {
    expect(withUtm("https://a.test/?utm_source=old", "m", "c", "x")).toBe("https://a.test/?utm_source=inner-system-map&utm_medium=m&utm_campaign=c&utm_content=x");
  });
});

describe("partner links", () => {
  it("builds /{locale}?ref=CODE and rejects codes partners could not type back", () => {
    expect(partnerLink("https://map.example.org", "es", "studio-om")).toBe("https://map.example.org/es?ref=studio-om");
    expect(() => partnerLink("https://map.example.org", "en", "Studio Om")).toThrow(/Invalid partner code/);
  });
});

describe("shareUrl", async () => {
  const { shareUrl } = await import("@/marketing/links");
  it("is the landing page with a share tag, nothing else", () => {
    expect(shareUrl("https://map.example.org", "ro")).toBe("https://map.example.org/ro?utm_source=share");
  });
});
