import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { incrementFunnel } from "@/marketing/server/funnel-counts";
import { funnelCountSchema } from "@/marketing/validation";

export const runtime = "nodejs";

/** Anonymous start/completion counter per partner code (marketing). Stores aggregates only. */
export async function POST(request: Request) {
  const limit = await rateLimit(`mkt-funnel:${clientKey(request)}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = funnelCountSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  if (!dbConfigured()) return new NextResponse(null, { status: 204 });
  try {
    await incrementFunnel(parsed.data.event, parsed.data.ref);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("funnel count failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "count_failed" }, { status: 502 });
  }
}
