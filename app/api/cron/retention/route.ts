import { NextResponse } from "next/server";
import { asService } from "@/lib/db";

export const runtime = "nodejs";

/** Vercel Cron target (see vercel.ts). Vercel sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { rows } = await asService((db) => db.query<{ attempts_deleted: number; public_results_deleted: number }>("select * from app.run_retention()"));
    const r = rows[0] ?? { attempts_deleted: 0, public_results_deleted: 0 };
    console.log("retention run", { attemptsDeleted: r.attempts_deleted, publicResultsDeleted: r.public_results_deleted });
    return NextResponse.json({ ok: true, ...r });
  } catch (err) {
    console.error("retention failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "retention_failed" }, { status: 500 });
  }
}
