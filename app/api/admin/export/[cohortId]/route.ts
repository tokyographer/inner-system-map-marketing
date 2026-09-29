import { NextResponse } from "next/server";
import { buildCsv } from "@/lib/dashboard/csv";
import { requireRole } from "@/lib/dashboard/guard";
import { exportRows } from "@/lib/dashboard/queries";

export const runtime = "nodejs";

/** Identified item-level CSV. Admin only; the email lookup is refused in SQL for anyone else. */
export async function GET(_req: Request, ctx: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(cohortId)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const auth = await requireRole(["admin"]);
  if (!auth) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const rows = await exportRows(auth.user.id, cohortId, true);
    return new NextResponse(buildCsv(rows, true), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="cohort-${cohortId}-identified.csv"`, "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("identified export failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
