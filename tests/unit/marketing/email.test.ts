import { describe, expect, it } from "vitest";
import { LIVE_SESSION_URL } from "@/marketing/config";
import { instituteDetails, liveSessionFooter } from "@/marketing/email";

describe("instituteDetails", () => {
  it("lists source, medium and campaign, and the partner only when registered", () => {
    expect(instituteDetails({ utmSource: "newsletter", utmCampaign: "level-ii", ref: "typed-by-visitor" }, null)).toEqual([
      { label: "Source", value: "newsletter" }, { label: "Campaign", value: "level-ii" },
    ]);
    expect(instituteDetails({ utmMedium: "email", ref: "studio-om" }, "studio-om")).toEqual([
      { label: "Medium", value: "email" }, { label: "Partner", value: "studio-om" },
    ]);
    expect(instituteDetails(null, null)).toEqual([]);
  });
});

describe("liveSessionFooter", () => {
  it("is empty without a configured session and fills the template with the tagged URL otherwise", () => {
    expect(liveSessionFooter("en", (url) => `Join: ${url}`, { ...LIVE_SESSION_URL, en: "" })).toBeUndefined();
    expect(liveSessionFooter("es", (url) => `Ven: ${url}`, { ...LIVE_SESSION_URL, es: "https://example.org/live" }))
      .toBe("Ven: https://example.org/live?utm_source=inner-system-map&utm_medium=results&utm_campaign=live-session&utm_content=es");
  });
});
