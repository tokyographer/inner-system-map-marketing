import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ATTRIBUTION_KEY, ATTRIBUTION_MAX_AGE_MS, attributionFromSearch, attributionRequestFields, captureAttribution, commitAttribution, loadAttribution, resetPendingAttribution } from "@/marketing/attribution";
import { parseEmailMarketingFields } from "@/marketing/validation";

function fakeStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; }, clear: () => m.clear(), key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => m.get(k) ?? null, setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); },
  };
}

describe("attributionFromSearch", () => {
  it("reads utm_source, utm_medium, utm_campaign and ref", () => {
    expect(attributionFromSearch("?utm_source=newsletter&utm_medium=email&utm_campaign=level-ii&ref=Studio-Om")).toEqual({
      utmSource: "newsletter", utmMedium: "email", utmCampaign: "level-ii", ref: "studio-om",
    });
  });

  it("returns null without attribution, and drops invalid values one by one", () => {
    expect(attributionFromSearch("")).toBeNull();
    expect(attributionFromSearch("?foo=bar&utm_source=")).toBeNull();
    expect(attributionFromSearch("?ref=a&utm_source=<script>&utm_medium=Social")).toEqual({ utmMedium: "social" });
    expect(attributionFromSearch("?ref=has%20space")).toBeNull();
  });

  it("accepts slug-like utm values only, so a link cannot carry a name or an id with spaces or @", () => {
    expect(attributionFromSearch("?utm_campaign=jane%20doe&utm_source=a@b.c&utm_medium=spring_2026.v2")).toEqual({ utmMedium: "spring_2026.v2" });
    expect(attributionFromSearch(`?utm_campaign=${"a".repeat(65)}`)).toBeNull();
    expect(attributionFromSearch(`?utm_campaign=${"a".repeat(64)}`)?.utmCampaign).toHaveLength(64);
  });
});

describe("attribution storage", () => {
  beforeEach(() => { resetPendingAttribution(); vi.stubGlobal("window", { localStorage: fakeStorage() }); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("keeps attribution in memory only until the start form is submitted, then on the device", () => {
    captureAttribution("?utm_source=partner&ref=studio-om");
    captureAttribution("?no=attribution");
    expect(window.localStorage.getItem(ATTRIBUTION_KEY)).toBeNull();
    expect(loadAttribution()).toEqual({ utmSource: "partner", ref: "studio-om" });
    commitAttribution();
    resetPendingAttribution(); // a reload during the questionnaire
    expect(loadAttribution()).toEqual({ utmSource: "partner", ref: "studio-om" });
    expect(attributionRequestFields()).toEqual({ attribution: { utmSource: "partner", ref: "studio-om" } });
    captureAttribution("?utm_source=search");
    expect(loadAttribution()).toEqual({ utmSource: "search" });
  });

  it("commits nothing without attribution, expires after 30 days and ignores corrupt or tampered values", () => {
    commitAttribution();
    expect(window.localStorage.getItem(ATTRIBUTION_KEY)).toBeNull();
    captureAttribution("?ref=studio-om");
    commitAttribution(0);
    resetPendingAttribution();
    expect(loadAttribution(ATTRIBUTION_MAX_AGE_MS + 1)).toBeNull();
    window.localStorage.setItem(ATTRIBUTION_KEY, "{not json");
    expect(loadAttribution()).toBeNull();
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({ attribution: { ref: "BAD CODE" }, capturedAt: Date.now() }));
    expect(loadAttribution()).toBeNull();
    window.localStorage.removeItem(ATTRIBUTION_KEY);
    expect(attributionRequestFields()).toEqual({});
  });

  it("never throws when storage is blocked", () => {
    vi.stubGlobal("window", { get localStorage(): Storage { throw new Error("blocked"); } });
    captureAttribution("?ref=studio-om");
    expect(() => commitAttribution()).not.toThrow();
    resetPendingAttribution();
    expect(loadAttribution()).toBeNull();
  });
});

describe("parseEmailMarketingFields", () => {
  it("returns valid attribution and drops invalid or empty attribution without failing", () => {
    expect(parseEmailMarketingFields({ email: "x", attribution: { ref: "studio-om" } })).toEqual({ attribution: { ref: "studio-om" } });
    expect(parseEmailMarketingFields({ attribution: { ref: "NOT OK" } })).toEqual({ attribution: null });
    expect(parseEmailMarketingFields({ attribution: {} })).toEqual({ attribution: null });
    expect(parseEmailMarketingFields(null)).toEqual({ attribution: null });
  });
});
