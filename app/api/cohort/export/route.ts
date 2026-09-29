import type { QueryResultRow } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/server";
import { withUser } from "@/lib/db";

export const runtime = "nodejs";

/** Participant self-service export: everything RLS lets the signed-in user read about themselves. */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  try {
    const body = await withUser(user.id, async (db) => {
      const q = async <T extends QueryResultRow>(sql: string) => (await db.query<T>(sql, [user.id])).rows;
      return {
        exportedAt: new Date().toISOString(),
        account: { id: user.id, email: user.email, ...((await q<Record<string, unknown>>("select display_name, role, locale, created_at from public.profiles where id = $1"))[0] ?? {}) },
        memberships: await q("select cohort_id, pseudonym, joined_at from public.cohort_members where user_id = $1"),
        consents: await q("select kind, granted, policy_version, locale, granted_at, cohort_id from public.consents where user_id = $1 order by granted_at"),
        attempts: await q("select * from public.attempts where user_id = $1 order by completed_at desc"),
        notes: await q("select attempt_id, protector_key, body, shared_with_facilitator, updated_at from public.participant_notes where user_id = $1"),
      };
    });
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="inner-system-map-export.json"', "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("export failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
