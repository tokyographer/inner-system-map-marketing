/**
 * Runs against the marketing-dev Neon branch using DATABASE_URL from .env.local; skipped without it.
 * Creates its own Neon Auth users (as rls.test.ts does) and removes everything it made.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { asService } from "@/lib/db";
import { deletePartner, incrementFunnel, insertPartner, listRefCounts, pruneFunnelCounts, UNREGISTERED } from "@/marketing/server/funnel-counts";

function loadEnv() {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })); } catch { return {}; }
}
const env = loadEnv();
if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;

const run = Date.now().toString(36);
const users: Record<"admin" | "participant", string> = { admin: randomUUID(), participant: randomUUID() };
const codes: string[] = [];
const code = (name: string) => { const c = `t-${name}-${run}`; codes.push(c); return c; };
const count = (ref: string, event: string) => asService(async (db) => Number((await db.query("select coalesce(sum(count), 0) as n from public.marketing_funnel_counts where ref_code = $1 and event = $2 and day = current_date", [ref, event])).rows[0].n));

describe.skipIf(!env.DATABASE_URL)("marketing partners and funnel counts (Neon, m0002)", () => {
  beforeAll(async () => {
    for (const [name, id] of Object.entries(users)) {
      await asService((db) => db.query(`insert into neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt") values ($1, $2, $3, true, now(), now())`, [id, name, `mkt-${name}-${run}@example.test`]));
      await asService((db) => db.query("insert into public.profiles (id, role) values ($1, $2)", [id, name === "admin" ? "admin" : "participant"]));
    }
  }, 60_000);

  afterAll(async () => {
    await asService((db) => db.query("delete from public.marketing_funnel_counts where ref_code = any($1)", [codes]));
    await asService((db) => db.query("delete from public.marketing_partners where code = any($1)", [codes]));
    await asService((db) => db.query('delete from neon_auth."user" where id = any($1)', [Object.values(users)]));
  });

  it("only an admin registers partners, as themselves; only admins read the counts", async () => {
    const c = code("reg");
    await expect(insertPartner(users.participant, c, "Nope")).rejects.toThrow(/row-level security/);
    await expect(insertPartnerForeign(users.admin, users.participant, c)).rejects.toThrow(/row-level security/);
    await insertPartner(users.admin, c, "Test partner");
    await incrementFunnel("start", c);
    const adminRows = await listRefCounts(users.admin);
    expect(adminRows.find((r) => r.ref === c)).toMatchObject({ label: "Test partner", starts: 1, completions: 0 });
    expect(await listRefCounts(users.participant)).toEqual([]);
  });

  it("counts registered codes on their own row and every other code under '-'; prunes old rows", async () => {
    const c = code("count");
    await insertPartner(users.admin, c, "Test partner");
    const unregisteredBefore = await count(UNREGISTERED, "start");
    await incrementFunnel("start", c);
    await incrementFunnel("start", c);
    await incrementFunnel("complete", c);
    await incrementFunnel("start", `nobody-${run}`);
    expect(await count(c, "start")).toBe(2);
    expect(await count(c, "complete")).toBe(1);
    expect(await count(UNREGISTERED, "start")).toBe(unregisteredBefore + 1);

    await asService((db) => db.query("insert into public.marketing_funnel_counts (day, ref_code, event, count) values (current_date - 401, $1, 'start', 5)", [c]));
    expect(await pruneFunnelCounts()).toBeGreaterThanOrEqual(1);
    expect((await asService((db) => db.query("select 1 from public.marketing_funnel_counts where ref_code = $1 and day < current_date - 400", [c]))).rows).toEqual([]);
  });

  it("removing a partner folds its counts into '-', so a later partner with the same code starts from zero", async () => {
    const c = code("rm");
    await insertPartner(users.admin, c, "Leaving partner");
    await incrementFunnel("start", c);
    await incrementFunnel("start", c);
    const unregisteredBefore = await count(UNREGISTERED, "start");
    expect(await deletePartner(users.participant, c)).toBe(false);
    expect(await deletePartner(users.admin, c)).toBe(true);
    expect(await count(c, "start")).toBe(0);
    expect(await count(UNREGISTERED, "start")).toBe(unregisteredBefore + 2);
    await insertPartner(users.admin, c, "New partner");
    expect((await listRefCounts(users.admin)).find((r) => r.ref === c)).toMatchObject({ label: "New partner", starts: 0 });
  });

  it("app_user cannot write counts unless admin", async () => {
    const { withUser } = await import("@/lib/db");
    await expect(withUser(users.participant, (db) => db.query("insert into public.marketing_funnel_counts (event) values ('start')"))).rejects.toThrow(/row-level security/);
  });
});

/** An admin trying to register a partner in someone else's name: RLS requires created_by = self. */
async function insertPartnerForeign(adminId: string, otherId: string, c: string) {
  const { withUser } = await import("@/lib/db");
  await withUser(adminId, (db) => db.query("insert into public.marketing_partners (code, label, created_by) values ($1, 'x', $2)", [c, otherId]));
}
