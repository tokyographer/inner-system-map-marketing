/**
 * Runs against the Neon development branch using DATABASE_URL from .env.local.
 * Skipped when the variable is absent. Creates its own Neon Auth users (rows in
 * neon_auth."user") and removes everything it made.
 */
import { Pool, neonConfig } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build } from "../unit/scoring/helpers";

function loadEnv(): Record<string, string> {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })); } catch { return {}; }
}
const env = loadEnv();
const URL = env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL;
const enabled = Boolean(URL);
neonConfig.webSocketConstructor ??= globalThis.WebSocket;
const pool = enabled ? new Pool({ connectionString: URL }) : null;

type Row = Record<string, unknown>;
async function service(sql: string, params: unknown[] = []): Promise<Row[]> {
  const c = await pool!.connect();
  try { return (await c.query(sql, params)).rows; } finally { c.release(); }
}
/** Mirrors lib/db withUser: one transaction as app_user with app.user_id set. */
async function as(userId: string | null, sql: string, params: unknown[] = []): Promise<{ rows: Row[]; error: string | null }> {
  const c = await pool!.connect();
  try {
    await c.query("begin");
    await c.query("set local role app_user");
    if (userId) await c.query("select set_config('app.user_id', $1, true)", [userId]);
    try {
      const r = await c.query(sql, params);
      await c.query("commit");
      return { rows: r.rows, error: null };
    } catch (e) {
      await c.query("rollback");
      return { rows: [], error: e instanceof Error ? e.message : String(e) };
    }
  } finally { c.release(); }
}

const run = Date.now().toString(36);
const ids: Record<string, string> = {};
const CODE = `RLS-${run}`;
let cohortA = "", cohortB = "", attemptP1 = "";

async function user(name: string, role?: "admin" | "facilitator") {
  const id = randomUUID();
  ids[name] = id;
  await service(`insert into neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt") values ($1, $2, $3, true, now(), now())`, [id, name, `${name}-${run}@example.test`]);
  await service("insert into public.profiles (id, role) values ($1, $2)", [id, role ?? "participant"]);
}

describe.skipIf(!enabled)("RLS and SQL functions (Neon)", () => {
  beforeAll(async () => {
    await user("admin", "admin");
    const a = await service("insert into public.cohorts (name, access_code_hash, access_code_expires_at) values ($1, app.hash_access_code($2), now() + interval '1 day') returning id", [`A ${run}`, CODE]);
    const b = await service("insert into public.cohorts (name, access_code_hash, access_code_expires_at) values ($1, 'y', now() + interval '1 day') returning id", [`B ${run}`]);
    cohortA = a[0].id as string; cohortB = b[0].id as string;
    await user("p1"); await user("p2"); await user("p3");
    await user("facA", "facilitator"); await user("facB", "facilitator");
    await service("insert into public.cohort_facilitators (cohort_id, user_id) values ($1, $2), ($3, $4)", [cohortA, ids.facA, cohortB, ids.facB]);
  }, 60_000);

  afterAll(async () => {
    await service("delete from public.cohorts where id = any($1)", [[cohortA, cohortB]]);
    await service('delete from neon_auth."user" where id = any($1)', [Object.values(ids)]);
    await pool!.end();
  });

  it("app_user cannot look up or hash access codes; the service connection can", async () => {
    expect((await as(ids.p1, "select * from app.lookup_access_code($1)", [CODE])).error ?? "no error").toMatch(/permission denied/);
    expect((await as(ids.p1, "select app.hash_access_code($1)", [CODE])).error ?? "no error").toMatch(/permission denied/);
    const rows = await service("select id from app.lookup_access_code($1)", [CODE]);
    expect(rows[0]?.id).toBe(cohortA);
    expect(await service("select id from app.lookup_access_code($1)", ["WRONG-1"])).toEqual([]);
  });

  it("participants join with the code and consent; attempts need store_results consent", async () => {
    for (const n of ["p1", "p2", "p3"]) {
      const r = await as(ids[n], "select app.join_cohort_with_code($1) as id", [CODE]);
      expect(r.error).toBeNull(); expect(r.rows[0].id).toBe(cohortA);
    }
    expect((await as(null, "select app.join_cohort_with_code($1)", [CODE])).error ?? "no error").toMatch(/not signed in/);
    const consent = (u: string, kind: string, granted = true) => as(ids[u], "insert into public.consents (user_id, cohort_id, kind, granted, policy_version, locale) values ($1, $2, $3, $4, 't', 'en')", [ids[u], cohortA, kind, granted]);
    await consent("p1", "store_results"); await consent("p1", "facilitator_visibility"); await consent("p2", "store_results");
    const attempt = (u: string, owner = u) => as(ids[u],
      `insert into public.attempts (user_id, cohort_id, item_bank_version, scoring_version, form, locale, seed, started_at, duration_seconds, responses, scores, pattern, self_score, top_protectors, top_exile)
       values ($1, $2, 'v2', 't', 'short', 'en', 1, now(), 300, $3, '{}', 'QUIET_OR_GUARDED', 3, '{PERF}', 'SHAM') returning id`, [ids[owner], cohortA, JSON.stringify(build("short", {}, 3))]);
    const a1 = await attempt("p1"); expect(a1.error).toBeNull(); attemptP1 = a1.rows[0].id as string;
    expect((await attempt("p3")).error ?? "no error").toMatch(/row-level security/);
    expect((await attempt("p2", "p1")).error ?? "no error").toMatch(/row-level security/);
  });

  it("a participant cannot read another participant's attempts, notes or profile", async () => {
    expect((await as(ids.p2, "select id from public.attempts")).rows.map((r) => r.id)).not.toContain(attemptP1);
    expect((await as(ids.p2, "select id from public.profiles where id = $1", [ids.p1])).rows).toEqual([]);
    await as(ids.p1, "insert into public.participant_notes (attempt_id, user_id, protector_key, body) values ($1, $2, 'PERF', 'private')", [attemptP1, ids.p1]);
    expect((await as(ids.p2, "select id from public.participant_notes")).rows).toEqual([]);
  });

  it("facilitator sees attempts only while visibility consent is active; other cohort's facilitator sees nothing", async () => {
    expect((await as(ids.facA, "select id from public.attempts")).rows.map((r) => r.id)).toContain(attemptP1);
    expect((await as(ids.facA, "select id from public.participant_notes")).rows).toEqual([]);
    await as(ids.p1, "update public.participant_notes set shared_with_facilitator = true where attempt_id = $1", [attemptP1]);
    expect((await as(ids.facA, "select body from public.participant_notes")).rows[0]?.body).toBe("private");
    expect((await as(ids.facB, "select id from public.attempts")).rows).toEqual([]);
    expect((await as(ids.facB, "select user_id from public.cohort_members where cohort_id = $1", [cohortA])).rows).toEqual([]);
    await as(ids.p1, "insert into public.consents (user_id, cohort_id, kind, granted, policy_version, locale) values ($1, $2, 'facilitator_visibility', false, 't', 'en')", [ids.p1, cohortA]);
    expect((await as(ids.facA, "select id from public.attempts")).rows).toEqual([]);
  });

  it("a participant cannot escalate their role and cannot touch public_results", async () => {
    expect((await as(ids.p1, "update public.profiles set role = 'admin' where id = $1", [ids.p1])).error ?? "no error").toMatch(/admin/);
    expect((await as(ids.p1, "select role from public.profiles where id = $1", [ids.p1])).rows[0].role).toBe("participant");
    expect((await as(ids.p1, "select * from public.public_results")).error ?? "no error").toMatch(/permission denied/);
    expect((await as(ids.p1, "select * from app.run_retention()")).error ?? "no error").toMatch(/permission denied/);
  });

  it("delete_my_data removes every app row for the user", async () => {
    expect((await as(ids.p1, "select app.delete_my_data()")).error).toBeNull();
    for (const [table, col] of [["attempts", "user_id"], ["participant_notes", "user_id"], ["consents", "user_id"], ["cohort_members", "user_id"], ["profiles", "id"]]) {
      expect(await service(`select 1 from public.${table} where ${col} = $1`, [ids.p1]), table).toEqual([]);
    }
  });

  it("run_retention deletes expired public results (service only)", async () => {
    await service("insert into public.public_results (email, locale, item_bank_version, scoring_version, form, responses, scores, policy_version, delete_token_hash, expires_at) values ('x@example.test', 'en', 'v2', 't', 'short', '{}', '{}', 't', 'h', now() - interval '1 second')");
    const rows = await service("select * from app.run_retention()");
    expect(Number(rows[0].public_results_deleted)).toBeGreaterThanOrEqual(1);
  });
});
