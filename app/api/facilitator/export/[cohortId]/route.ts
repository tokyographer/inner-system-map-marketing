import { NextResponse } from "next/server";
import { buildCsv } from "@/lib/dashboard/csv";
import { requireRole } from "@/lib/dashboard/guard";
import { exportRows } from "@/lib/dashboard/queries";

export const runtime = "nodejs";

/** Pseudonymised item-level CSV for facilitators and admins of the cohort (RLS scopes the rows). */
export async function GET(_req: Request, ctx: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(cohortId)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const auth = await requireRole(["facilitator", "admin"]);
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const rows = await exportRows(auth.user.id, cohortId, false);
    return new NextResponse(buildCsv(rows, false), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="cohort-${cohortId}-items.csv"`, "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("export failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
