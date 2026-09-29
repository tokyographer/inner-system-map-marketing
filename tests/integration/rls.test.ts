/**
 * Runs against a local Supabase (npx supabase start) using keys from .env.local.
 * Skipped when the keys are absent so `npm test` stays green without Docker.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build } from "../unit/scoring/helpers";
import type { Database } from "@/lib/supabase/types";

function loadEnv(): Record<string, string> {
  try {
    return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }));
  } catch { return {}; }
}
const env = loadEnv();
const URL = env.NEXT_PUBLIC_SUPABASE_URL, ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY, SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(URL && ANON && SERVICE);

type Client = SupabaseClient<Database>;
const admin = enabled ? createClient<Database>(URL, SERVICE, { auth: { persistSession: false } }) : null;
const run = Date.now().toString(36);
const password = "Test-pass-1234!";
const ids: Record<string, string> = {};
const clients: Record<string, Client> = {};

async function user(name: string, role?: "admin" | "facilitator"): Promise<Client> {
  const email = `${name}-${run}@example.test`;
  const { data, error } = await admin!.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  ids[name] = data.user.id;
  if (role) await admin!.from("profiles").update({ role }).eq("id", data.user.id);
  const c = createClient<Database>(URL, ANON, { auth: { persistSession: false } });
  const { error: sErr } = await c.auth.signInWithPassword({ email, password });
  if (sErr) throw sErr;
  clients[name] = c;
  return c;
}

const CODE = `RLS-${run}`;
let cohortA = "", cohortB = "", attemptP1 = "";

describe.skipIf(!enabled)("RLS and SQL functions (local Supabase)", () => {
  beforeAll(async () => {
    await user("admin", "admin");
    const { data: a } = await admin!.from("cohorts").insert({ name: `A ${run}`, access_code_hash: "x", access_code_expires_at: new Date(Date.now() + 864e5).toISOString() }).select("id").single();
    const { data: b } = await admin!.from("cohorts").insert({ name: `B ${run}`, access_code_hash: "y", access_code_expires_at: new Date(Date.now() + 864e5).toISOString() }).select("id").single();
    cohortA = a!.id; cohortB = b!.id;
    const { data: hash } = await admin!.rpc("hash_access_code", { p_code: CODE });
    await admin!.from("cohorts").update({ access_code_hash: hash! }).eq("id", cohortA);
    await user("p1"); await user("p2"); await user("p3");
    await user("facA", "facilitator"); await user("facB", "facilitator");
    await admin!.from("cohort_facilitators").insert([{ cohort_id: cohortA, user_id: ids.facA }, { cohort_id: cohortB, user_id: ids.facB }]);
  }, 60_000);

  afterAll(async () => {
    for (const name of Object.keys(ids)) await admin!.auth.admin.deleteUser(ids[name]).catch(() => {});
    await admin!.from("cohorts").delete().in("id", [cohortA, cohortB]);
  });

  it("anon cannot look up access codes; the server can", async () => {
    const anon = createClient<Database>(URL, ANON, { auth: { persistSession: false } });
    const { error } = await anon.rpc("lookup_access_code", { p_code: CODE });
    expect(error).not.toBeNull();
    const { data } = await admin!.rpc("lookup_access_code", { p_code: CODE });
    expect(data?.[0]?.id).toBe(cohortA);
    const { data: none } = await admin!.rpc("lookup_access_code", { p_code: "WRONG-1" });
    expect(none).toEqual([]);
  });

  it("participants join with the code and consent; attempts need store_results consent", async () => {
    for (const name of ["p1", "p2", "p3"]) {
      const { data, error } = await clients[name].rpc("join_cohort_with_code", { p_code: CODE });
      expect(error).toBeNull(); expect(data).toBe(cohortA);
    }
    const base = (u: string) => ({ user_id: ids[u], cohort_id: cohortA, policy_version: "t", locale: "en" });
    await clients.p1.from("consents").insert([{ ...base("p1"), kind: "store_results", granted: true }, { ...base("p1"), kind: "facilitator_visibility", granted: true }]);
    await clients.p2.from("consents").insert([{ ...base("p2"), kind: "store_results", granted: true }]);
    const attempt = (u: string) => ({
      user_id: ids[u], cohort_id: cohortA, item_bank_version: "v2", scoring_version: "t", form: "short" as const, locale: "en", seed: 1,
      started_at: new Date().toISOString(), duration_seconds: 300, responses: build("short", {}, 3), scores: {}, pattern: "QUIET_OR_GUARDED",
      self_score: 3, top_protectors: ["PERF"], top_exile: "SHAM",
    });
    const { data: a1, error: e1 } = await clients.p1.from("attempts").insert(attempt("p1")).select("id").single();
    expect(e1).toBeNull(); attemptP1 = a1!.id;
    const { error: e3 } = await clients.p3.from("attempts").insert(attempt("p3"));
    expect(e3).not.toBeNull();
    const { error: eSpoof } = await clients.p2.from("attempts").insert({ ...attempt("p2"), user_id: ids.p1 });
    expect(eSpoof).not.toBeNull();
  });

  it("a participant cannot read another participant's attempts, notes or profile", async () => {
    const { data } = await clients.p2.from("attempts").select("id");
    expect(data?.map((r) => r.id)).not.toContain(attemptP1);
    const { data: prof } = await clients.p2.from("profiles").select("id").eq("id", ids.p1);
    expect(prof).toEqual([]);
    await clients.p1.from("participant_notes").insert({ attempt_id: attemptP1, user_id: ids.p1, protector_key: "PERF", body: "private", shared_with_facilitator: false });
    const { data: notes } = await clients.p2.from("participant_notes").select("id");
    expect(notes).toEqual([]);
  });

  it("facilitator of the cohort sees attempts only while visibility consent is active; other cohort's facilitator sees nothing", async () => {
    const { data: seen } = await clients.facA.from("attempts").select("id");
    expect(seen?.map((r) => r.id)).toContain(attemptP1);
    const { data: notesHidden } = await clients.facA.from("participant_notes").select("id");
    expect(notesHidden).toEqual([]);
    await clients.p1.from("participant_notes").update({ shared_with_facilitator: true }).eq("attempt_id", attemptP1);
    const { data: notesShared } = await clients.facA.from("participant_notes").select("body");
    expect(notesShared?.[0]?.body).toBe("private");
    const { data: other } = await clients.facB.from("attempts").select("id");
    expect(other).toEqual([]);
    const { data: otherMembers } = await clients.facB.from("cohort_members").select("user_id").eq("cohort_id", cohortA);
    expect(otherMembers).toEqual([]);
    await clients.p1.from("consents").insert({ user_id: ids.p1, cohort_id: cohortA, kind: "facilitator_visibility", granted: false, policy_version: "t", locale: "en" });
    const { data: afterWithdraw } = await clients.facA.from("attempts").select("id");
    expect(afterWithdraw).toEqual([]);
  });

  it("a participant cannot escalate their role", async () => {
    const { error } = await clients.p1.from("profiles").update({ role: "admin" }).eq("id", ids.p1);
    expect(error).not.toBeNull();
    const { data } = await clients.p1.from("profiles").select("role").eq("id", ids.p1).single();
    expect(data?.role).toBe("participant");
  });

  it("delete_my_account removes every row and the auth user", async () => {
    const { error } = await clients.p1.rpc("delete_my_account");
    expect(error).toBeNull();
    for (const table of ["attempts", "participant_notes", "consents", "cohort_members", "profiles"] as const) {
      const col = table === "profiles" ? "id" : "user_id";
      const { data } = await admin!.from(table).select("*").filter(col, "eq", ids.p1);
      expect(data, table).toEqual([]);
    }
    const { data: u } = await admin!.auth.admin.getUserById(ids.p1);
    expect(u.user).toBeNull();
    delete ids.p1;
  });

  it("run_retention is server-only and deletes expired public results", async () => {
    const { error: denied } = await clients.p2.rpc("run_retention");
    expect(denied).not.toBeNull();
    await admin!.from("public_results").insert({ email: "x@example.test", locale: "en", item_bank_version: "v2", scoring_version: "t", form: "short", responses: {}, scores: {}, policy_version: "t", delete_token_hash: "h", expires_at: new Date(Date.now() - 1000).toISOString() });
    const { data, error } = await admin!.rpc("run_retention");
    expect(error).toBeNull();
    expect(data?.[0]?.public_results_deleted).toBeGreaterThanOrEqual(1);
  });
});
