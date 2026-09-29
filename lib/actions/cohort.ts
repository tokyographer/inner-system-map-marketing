"use server";
/**
 * Cohort-mode server actions on Neon. Every input is validated with zod.
 * Responses and emails are never logged. Access-code lookup runs as the
 * service connection so a person can be told "code valid" before they have
 * an account; everything else runs inside withUser() under RLS.
 */
import { cookies, headers } from "next/headers";
import { ITEM_BANK_VERSION } from "@/config/app";
import { SCORING_VERSION } from "@/config/scoring";
import { auth, currentUser } from "@/lib/auth/server";
import { asService, withUser } from "@/lib/db";
import type { CohortSummary } from "@/lib/db/types";
import { rateLimit } from "@/lib/ratelimit";
import { score } from "@/lib/scoring";
import { cohortAttemptSchema, consentSchema, joinRequestSchema, noteSchema, verifyCodeSchema } from "@/lib/validation/cohort";
import { PENDING_CODE_COOKIE } from "./constants";

function reason(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "unknown";
}

type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: "invalid_input" | "invalid_code" | "invalid_otp" | "rate_limited" | "unavailable" | "not_signed_in" | "not_member" | "failed" };

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "anonymous";
}

async function lookupCode(code: string): Promise<CohortSummary | null> {
  return asService(async (db) => {
    const { rows } = await db.query<CohortSummary>("select id, name, level, language from app.lookup_access_code($1)", [code]);
    return rows[0] ?? null;
  });
}

/** Step 1: validate the access code, remember it, email a one-time sign-in code. */
export async function requestSignInCode(input: unknown): Promise<ActionResult> {
  const parsed = joinRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const limit = rateLimit(`join:${await clientKey()}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return { ok: false, error: "rate_limited" };
  try {
    if (!(await lookupCode(parsed.data.code))) return { ok: false, error: "invalid_code" };
    const store = await cookies();
    store.set(PENDING_CODE_COOKIE, parsed.data.code, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60, path: "/" });
    const { error } = await auth().emailOtp.sendVerificationOtp({ email: parsed.data.email, type: "sign-in" });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error("requestSignInCode failed", { reason: reason(err) });
    return { ok: false, error: "unavailable" };
  }
}

/** Step 2: sign in with the emailed code; make sure a profile row exists. */
export async function verifySignInCode(input: unknown): Promise<ActionResult> {
  const parsed = verifyCodeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const limit = rateLimit(`otp:${await clientKey()}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return { ok: false, error: "rate_limited" };
  try {
    const { error } = await auth().signIn.emailOtp({ email: parsed.data.email, otp: parsed.data.otp });
    if (error) return { ok: false, error: "invalid_otp" };
    const user = await currentUser();
    if (!user) return { ok: false, error: "failed" };
    await withUser(user.id, (db) => db.query("insert into public.profiles (id, locale) values ($1, $2) on conflict (id) do nothing", [user.id, parsed.data.locale]));
    return { ok: true };
  } catch (err) {
    console.error("verifySignInCode failed", { reason: reason(err) });
    return { ok: false, error: "unavailable" };
  }
}

export async function pendingCohort(): Promise<(CohortSummary & { code: string }) | null> {
  const code = (await cookies()).get(PENDING_CODE_COOKIE)?.value;
  if (!code) return null;
  try {
    const c = await lookupCode(code);
    return c ? { ...c, code } : null;
  } catch {
    return null;
  }
}

export async function recordConsentAndJoin(input: unknown): Promise<ActionResult<{ cohortId: string }>> {
  const parsed = consentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  try {
    const cohortId = await withUser(user.id, async (db) => {
      const { rows } = await db.query<{ id: string }>("select app.join_cohort_with_code($1) as id", [parsed.data.code]);
      const id = rows[0]?.id;
      if (!id) throw new Error("invalid_code");
      const d = parsed.data;
      await db.query(
        `insert into public.consents (user_id, cohort_id, kind, granted, policy_version, locale) values
         ($1, $2, 'store_results', true, $3, $4), ($1, $2, 'facilitator_visibility', true, $3, $4), ($1, $2, 'newsletter', $5, $3, $4)`,
        [user.id, id, d.policyVersion, d.locale, d.newsletter],
      );
      return id;
    });
    (await cookies()).delete(PENDING_CODE_COOKIE);
    return { ok: true, data: { cohortId } };
  } catch (err) {
    const r = reason(err);
    console.error("recordConsentAndJoin failed", { reason: r });
    return { ok: false, error: /invalid or expired|invalid_code/.test(r) ? "invalid_code" : "failed" };
  }
}

export async function saveCohortAttempt(input: unknown): Promise<ActionResult<{ attemptId: string }>> {
  const parsed = cohortAttemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  const d = parsed.data;
  const durationSeconds = Math.round((d.completedAt - d.startedAt) / 1000);
  let result;
  try {
    result = score({ responses: d.responses, form: d.form, durationSeconds });
  } catch {
    return { ok: false, error: "invalid_input" };
  }
  try {
    const attemptId = await withUser(user.id, async (db) => {
      const { rows } = await db.query<{ id: string }>(
        `insert into public.attempts (user_id, cohort_id, item_bank_version, scoring_version, form, locale, seed, started_at, completed_at,
           duration_seconds, responses, scores, pattern, self_score, top_protectors, top_exile, quality_flags, care_flag)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) returning id`,
        [user.id, d.cohortId, ITEM_BANK_VERSION, SCORING_VERSION, d.form, d.locale, d.seed, new Date(d.startedAt).toISOString(), new Date(d.completedAt).toISOString(),
         durationSeconds, JSON.stringify(d.responses), JSON.stringify(result), result.pattern.key, result.self.mean, result.protectors.ranked.slice(0, 3), result.exiles.ranked[0],
         result.qualityFlags, result.careFlag],
      );
      return rows[0].id;
    });
    return { ok: true, data: { attemptId } };
  } catch (err) {
    const r = reason(err);
    console.error("saveCohortAttempt failed", { reason: r });
    return { ok: false, error: /row-level security/.test(r) ? "not_member" : "failed" };
  }
}

export async function saveNote(input: unknown): Promise<ActionResult> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  try {
    await withUser(user.id, (db) => db.query(
      `insert into public.participant_notes (attempt_id, user_id, protector_key, body, shared_with_facilitator)
       values ($1, $2, $3, $4, $5)
       on conflict (attempt_id, protector_key) do update set body = excluded.body, shared_with_facilitator = excluded.shared_with_facilitator, updated_at = now()`,
      [parsed.data.attemptId, user.id, parsed.data.protectorKey, parsed.data.body, parsed.data.shareWithFacilitator],
    ));
    return { ok: true };
  } catch (err) {
    console.error("saveNote failed", { reason: reason(err) });
    return { ok: false, error: "failed" };
  }
}

export async function deleteAccount(confirmation: unknown): Promise<ActionResult> {
  if (confirmation !== "DELETE") return { ok: false, error: "invalid_input" };
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  try {
    await withUser(user.id, (db) => db.query("select app.delete_my_data()"));
    // Neon Auth keeps its tables in this database: removing the user row cascades to sessions and accounts.
    await asService((db) => db.query('delete from neon_auth."user" where id = $1', [user.id]));
    await auth().signOut().catch(() => {});
    return { ok: true };
  } catch (err) {
    console.error("deleteAccount failed", { reason: reason(err) });
    return { ok: false, error: "failed" };
  }
}

export async function signOut(): Promise<void> {
  await auth().signOut();
}
