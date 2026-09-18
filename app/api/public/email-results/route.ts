import { NextResponse } from "next/server";
import { PATTERNS } from "@/content/patterns.en";
import { readEmailEnv, sendResultsEmail } from "@/lib/email/send-results";
import { renderResultsPdf } from "@/lib/pdf/render";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { score } from "@/lib/scoring";
import { emailRequestSchema } from "@/lib/validation/results-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = rateLimit(`email:${clientKey(request)}`, 3, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = emailRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  let env;
  try {
    env = readEmailEnv();
  } catch (err) {
    console.error("email-results misconfigured", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }
  try {
    const { responses, form, durationSeconds, locale, email } = parsed.data;
    const result = score({ responses, form, durationSeconds });
    const pdf = await renderResultsPdf({ result, locale, mode: "public" });
    await sendResultsEmail(
      { to: email, locale, pdf, patternTitle: PATTERNS[result.pattern.key].title, flooded: result.pattern.key === "FLOODED" },
      env,
    );
    return NextResponse.json({ ok: true, copySentToInstitute: env.copyTo !== null });
  } catch (err) {
    console.error("email-results failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "email_failed" }, { status: 502 });
  }
}
