import { NextResponse } from "next/server";
import { score } from "@/lib/scoring";
import { renderResultsPdf } from "@/lib/pdf/render";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { pdfRequestSchema } from "@/lib/validation/results-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = await rateLimit(`pdf:${clientKey(request)}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = pdfRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  try {
    const result = score({ responses: parsed.data.responses, form: parsed.data.form, durationSeconds: parsed.data.durationSeconds });
    const pdf = await renderResultsPdf({ result, locale: parsed.data.locale, mode: "public", name: parsed.data.name });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="inner-system-map-results.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("results-pdf failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "pdf_failed" }, { status: 500 });
  }
}
