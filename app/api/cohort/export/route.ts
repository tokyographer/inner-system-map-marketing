import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Participant self-service export: everything RLS lets the signed-in user read about themselves. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  try {
    const [profile, memberships, consents, attempts, notes] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, locale, created_at").eq("id", user.id).single(),
      supabase.from("cohort_members").select("cohort_id, pseudonym, joined_at").eq("user_id", user.id),
      supabase.from("consents").select("kind, granted, policy_version, locale, granted_at, cohort_id").eq("user_id", user.id),
      supabase.from("attempts").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }),
      supabase.from("participant_notes").select("attempt_id, protector_key, body, shared_with_facilitator, updated_at").eq("user_id", user.id),
    ]);
    const body = {
      exportedAt: new Date().toISOString(),
      account: { id: user.id, email: user.email, ...(profile.data ?? {}) },
      memberships: memberships.data ?? [], consents: consents.data ?? [], attempts: attempts.data ?? [], notes: notes.data ?? [],
    };
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="inner-system-map-export.json"', "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("export failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
