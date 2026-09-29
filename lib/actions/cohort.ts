"use server";
/**
 * Cohort-mode server actions. Every input is validated with zod. Responses
 * and emails are never logged. Access-code lookup uses the service role so a
 * person can be told "code valid" before they have an account; everything
 * else runs as the signed-in user under RLS.
 */
import { cookies, headers } from "next/headers";
import { ITEM_BANK_VERSION } from "@/config/app";
import { SCORING_VERSION } from "@/config/scoring";
import { rateLimit } from "@/lib/ratelimit";
import { score } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cohortAttemptSchema, consentSchema, joinRequestSchema, noteSchema } from "@/lib/validation/cohort";

import { PENDING_CODE_COOKIE } from "./constants";
function reason(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "unknown";
}

type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: "invalid_input" | "invalid_code" | "rate_limited" | "unavailable" | "not_signed_in" | "not_member" | "failed" };

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "anonymous";
}

export async function requestMagicLink(input: unknown): Promise<ActionResult> {
  const parsed = joinRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const limit = rateLimit(`join:${await clientKey()}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return { ok: false, error: "rate_limited" };

  try {
    const admin = createAdminClient();
    const { data: cohorts, error } = await admin.rpc("lookup_access_code", { p_code: parsed.data.code });
    if (error) throw error;
    if (!cohorts || cohorts.length === 0) return { ok: false, error: "invalid_code" };

    const store = await cookies();
    store.set(PENDING_CODE_COOKIE, parsed.data.code, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60, path: "/" });

    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=/${parsed.data.locale}/cohort/consent`, data: { locale: parsed.data.locale } },
    });
    if (authError) throw authError;
    return { ok: true };
  } catch (err) {
    console.error("requestMagicLink failed", { reason: reason(err) });
    return { ok: false, error: "unavailable" };
  }
}

export async function pendingCohort(): Promise<{ code: string; id: string; name: string; level: string } | null> {
  const code = (await cookies()).get(PENDING_CODE_COOKIE)?.value;
  if (!code) return null;
  try {
    const { data } = await createAdminClient().rpc("lookup_access_code", { p_code: code });
    const c = data?.[0];
    return c ? { code, id: c.id, name: c.name, level: c.level } : null;
  } catch {
    return null;
  }
}

export async function recordConsentAndJoin(input: unknown): Promise<ActionResult<{ cohortId: string }>> {
  const parsed = consentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  try {
    const { data: cohortId, error } = await supabase.rpc("join_cohort_with_code", { p_code: parsed.data.code });
    if (error || !cohortId) return { ok: false, error: "invalid_code" };
    const base = { user_id: user.id, cohort_id: cohortId, policy_version: parsed.data.policyVersion, locale: parsed.data.locale };
    const { error: cErr } = await supabase.from("consents").insert([
      { ...base, kind: "store_results", granted: true },
      { ...base, kind: "facilitator_visibility", granted: true },
      { ...base, kind: "newsletter", granted: parsed.data.newsletter },
    ]);
    if (cErr) throw cErr;
    (await cookies()).delete(PENDING_CODE_COOKIE);
    return { ok: true, data: { cohortId } };
  } catch (err) {
    console.error("recordConsentAndJoin failed", { reason: reason(err) });
    return { ok: false, error: "failed" };
  }
}

export async function saveCohortAttempt(input: unknown): Promise<ActionResult<{ attemptId: string }>> {
  const parsed = cohortAttemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  const d = parsed.data;
  const durationSeconds = Math.round((d.completedAt - d.startedAt) / 1000);
  let result;
  try {
    result = score({ responses: d.responses, form: d.form, durationSeconds });
  } catch {
    return { ok: false, error: "invalid_input" };
  }
  const { data, error } = await supabase.from("attempts").insert({
    user_id: user.id, cohort_id: d.cohortId, item_bank_version: ITEM_BANK_VERSION, scoring_version: SCORING_VERSION,
    form: d.form, locale: d.locale, seed: d.seed, started_at: new Date(d.startedAt).toISOString(), completed_at: new Date(d.completedAt).toISOString(),
    duration_seconds: durationSeconds, responses: d.responses, scores: JSON.parse(JSON.stringify(result)), pattern: result.pattern.key,
    self_score: result.self.mean, top_protectors: result.protectors.ranked.slice(0, 3), top_exile: result.exiles.ranked[0],
    quality_flags: result.qualityFlags, care_flag: result.careFlag,
  }).select("id").single();
  if (error || !data) {
    console.error("saveCohortAttempt failed", { reason: error?.message ?? "no row" });
    return { ok: false, error: error?.code === "42501" ? "not_member" : "failed" };
  }
  return { ok: true, data: { attemptId: data.id } };
}

export async function saveNote(input: unknown): Promise<ActionResult> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  const { error } = await supabase.from("participant_notes").upsert(
    { attempt_id: parsed.data.attemptId, user_id: user.id, protector_key: parsed.data.protectorKey, body: parsed.data.body, shared_with_facilitator: parsed.data.shareWithFacilitator, updated_at: new Date().toISOString() },
    { onConflict: "attempt_id,protector_key" },
  );
  if (error) { console.error("saveNote failed", { reason: error.message }); return { ok: false, error: "failed" }; }
  return { ok: true };
}

export async function deleteAccount(confirmation: unknown): Promise<ActionResult> {
  if (confirmation !== "DELETE") return { ok: false, error: "invalid_input" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  const { error } = await supabase.rpc("delete_my_account");
  if (error) { console.error("deleteAccount failed", { reason: error.message }); return { ok: false, error: "failed" }; }
  await supabase.auth.signOut();
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

