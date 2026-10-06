import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { deletePublicResult, storePublicResult } from "@/lib/public-results/store";
import { asService } from "@/lib/db";
import { score } from "@/lib/scoring";
import { saveResultAttribution } from "@/marketing/server/attribution";
import { build } from "../unit/scoring/helpers";

function loadEnv() {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })); } catch { return {}; }
}
const env = loadEnv();
if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;

describe.skipIf(!env.DATABASE_URL)("marketing attribution on public results (Neon, m0001)", () => {
  it("stores utm_* and a registered ref on the row, drops an unregistered ref, and deletes them with the row", async () => {
    const code = `t-attr-${Date.now().toString(36)}`;
    await asService((db) => db.query("insert into public.marketing_partners (code, label) values ($1, 'Test partner')", [code]));
    const responses = build("short", {}, 3);
    const stored = await storePublicResult({ email: `mkt-${Date.now().toString(36)}@example.test`, locale: "en", form: "short", responses, result: score({ form: "short", responses }), newsletter: false, policyVersion: "t" });
    expect(await saveResultAttribution(stored.id, { utmSource: "newsletter", utmCampaign: "level-ii", ref: code })).toBe(true);
    const row = await asService(async (db) => (await db.query("select utm_source, utm_medium, utm_campaign, ref_code from public.public_results where id = $1", [stored.id])).rows[0]);
    expect(row).toEqual({ utm_source: "newsletter", utm_medium: null, utm_campaign: "level-ii", ref_code: code });
    expect(await saveResultAttribution(stored.id, { utmSource: "newsletter", ref: "nobody-registered" })).toBe(true);
    expect((await asService(async (db) => (await db.query("select ref_code from public.public_results where id = $1", [stored.id])).rows[0])).ref_code).toBeNull();
    expect(await deletePublicResult(stored.deleteToken)).toBe(true);
    expect(await saveResultAttribution(stored.id, { ref: code })).toBe(false);
    await asService((db) => db.query("delete from public.marketing_partners where code = $1", [code]));
  });
});
