"use server";
import { currentUser } from "@/lib/auth/server";
import { withUser } from "@/lib/db";
import { generateAccessCode, hashAccessCode } from "@/lib/dashboard/access-code";
import { assignFacilitatorSchema, createCohortSchema } from "@/lib/validation/admin";

type Res<T = undefined> = { ok: true; data?: T } | { ok: false; error: "invalid_input" | "not_signed_in" | "forbidden" | "user_not_found" | "failed" };

function reason(err: unknown): string { return err instanceof Error ? err.message : "unknown"; }

/** Creates a cohort and returns the plain access code once. The code is stored only as a hash. */
export async function createCohort(input: unknown): Promise<Res<{ cohortId: string; code: string }>> {
  const parsed = createCohortSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  const d = parsed.data;
  const code = generateAccessCode();
  try {
    const cohortId = await withUser(user.id, async (db) => {
      const { rows } = await db.query<{ id: string }>(
        `insert into public.cohorts (name, level, language, starts_on, ends_on, access_code_hash, access_code_expires_at, retention_months, created_by)
         values ($1, $2, $3, $4, $5, $6, ($7::date + interval '1 day'), $8, $9) returning id`,
        [d.name, d.level, d.language, d.startsOn || null, d.endsOn || null, hashAccessCode(code), d.codeExpiresOn, d.retentionMonths, user.id]);
      return rows[0].id;
    });
    return { ok: true, data: { cohortId, code } };
  } catch (err) {
    const r = reason(err);
    console.error("createCohort failed", { reason: r });
    return { ok: false, error: /row-level security/.test(r) ? "forbidden" : "failed" };
  }
}

export async function assignFacilitator(input: unknown): Promise<Res> {
  const parsed = assignFacilitatorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  try {
    const found = await withUser(user.id, async (db) => {
      const { rows } = await db.query<{ id: string }>("select id from app.find_user_by_email($1)", [parsed.data.email]);
      if (!rows[0]) return false;
      await db.query("select app.ensure_profile($1, 'facilitator')", [rows[0].id]);
      await db.query("insert into public.cohort_facilitators (cohort_id, user_id) values ($1, $2) on conflict do nothing", [parsed.data.cohortId, rows[0].id]);
      return true;
    });
    return found ? { ok: true } : { ok: false, error: "user_not_found" };
  } catch (err) {
    const r = reason(err);
    console.error("assignFacilitator failed", { reason: r });
    return { ok: false, error: /admin only|row-level security/.test(r) ? "forbidden" : "failed" };
  }
}
