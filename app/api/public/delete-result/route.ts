import { NextResponse } from "next/server";
import { LOCALES } from "@/config/app";
import { deletePublicResult } from "@/lib/public-results/store";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

/** One-click deletion from the results email. Always lands on the confirmation page, never reveals whether a row existed. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const locale = LOCALES.find((l) => l === searchParams.get("locale")) ?? "en";
  const limit = await rateLimit(`delete:${clientKey(request)}`, 20, 60 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  try {
    await deletePublicResult(token);
  } catch (err) {
    console.error("delete-result failed", { reason: err instanceof Error ? err.message : "unknown" });
  }
  return NextResponse.redirect(`${origin}/${locale}/results-deleted`);
}
