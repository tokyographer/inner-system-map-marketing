import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { asService, withUser } from "@/lib/db";
import { incrementFunnel, listRefCounts, pruneFunnelCounts, UNREGISTERED } from "@/marketing/server/funnel-counts";

function loadEnv() {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })); } catch { return {}; }
}
const env = loadEnv();
if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;

const count = (ref: string, event: string) => asService(async (db) => Number((await db.query("select coalesce(sum(count), 0) as n from public.marketing_funnel_counts where ref_code = $1 and event = $2 and day = current_date", [ref, event])).rows[0].n));

describe.skipIf(!env.DATABASE_URL)("marketing partners and funnel counts (Neon, m0002)", () => {
  it("counts registered codes on their own row and every other code under '-'; prunes old rows", async () => {
    const code = `t-${Date.now().toString(36)}`;
    await asService((db) => db.query("insert into public.marketing_partners (code, label) values ($1, 'Test partner')", [code]));
    const unregisteredBefore = await count(UNREGISTERED, "start");
    await incrementFunnel("start", code);
    await incrementFunnel("start", code);
    await incrementFunnel("complete", code);
    await incrementFunnel("start", `nobody-${Date.now().toString(36)}`);
    expect(await count(code, "start")).toBe(2);
    expect(await count(code, "complete")).toBe(1);
    expect(await count(UNREGISTERED, "start")).toBe(unregisteredBefore + 1);

    await asService((db) => db.query("insert into public.marketing_funnel_counts (day, ref_code, event, count) values (current_date - 401, $1, 'start', 5)", [code]));
    expect(await pruneFunnelCounts()).toBeGreaterThanOrEqual(1);
    expect((await asService((db) => db.query("select 1 from public.marketing_funnel_counts where ref_code = $1 and day < current_date - 400", [code]))).rows).toEqual([]);

    await asService((db) => db.query("delete from public.marketing_funnel_counts where ref_code = $1", [code]));
    await asService((db) => db.query("delete from public.marketing_partners where code = $1", [code]));
  });

  it("non-admins read nothing and cannot write counts or register partners", async () => {
    const someone = randomUUID();
    expect(await listRefCounts(someone)).toEqual([]);
    await expect(withUser(someone, (db) => db.query("insert into public.marketing_funnel_counts (event) values ('start')"))).rejects.toThrow();
    await expect(withUser(someone, (db) => db.query("insert into public.marketing_partners (code, label, created_by) values ('x-y', 'x', $1)", [someone]))).rejects.toThrow();
  });
});
