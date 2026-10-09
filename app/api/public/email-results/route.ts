import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { WHATSAPP_RESULTS_READY } from "@/config/app";
import { getContent } from "@/content";
import { readEmailEnv, sendResultsEmail } from "@/lib/email/send-results";
import { renderResultsPdf } from "@/lib/pdf/render";
import { clientKey, rateLimit, sharedLimiterConfigured } from "@/lib/ratelimit";
import { score } from "@/lib/scoring";
import { emailRequestSchema } from "@/lib/validation/results-request";
import { recordWhatsApp, storePublicResult } from "@/lib/public-results/store";
import { dbConfigured } from "@/lib/db";
import { readWhatsAppEnv, recipientKey, sendResultsWhatsApp } from "@/lib/whatsapp/send-results";
import { parseEmailMarketingFields } from "@/marketing/validation";
import { saveResultAttribution } from "@/marketing/server/attribution";
import { instituteDetails, liveSessionFooter } from "@/marketing/email";
import { getTranslations } from "next-intl/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = await rateLimit(`email:${clientKey(request)}`, 3, 60 * 60 * 1000);
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
  // Per recipient and overall, on top of the per-client window: the email carries the institute's name.
  const recipient = await rateLimit(`email-to:${createHash("sha256").update(parsed.data.email).digest("hex")}`, 3, 24 * 60 * 60 * 1000);
  const overall = recipient.ok ? await rateLimit("email:all", 60, 60 * 60 * 1000) : recipient;
  if (!overall.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(overall.retryAfterSeconds) } });
  }
  let env;
  try {
    env = readEmailEnv();
  } catch (err) {
    console.error("email-results misconfigured", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }
  try {
    const { responses, form, durationSeconds, locale, email, name, consent } = parsed.data;
    const { attribution } = parseEmailMarketingFields(json);
    // Ignored entirely while the feature is off: not stored, not sent, not shown to the institute.
    // Marketing never reads this number: it is not passed to attribution, nurture or analytics.
    const whatsapp = WHATSAPP_RESULTS_READY && consent.whatsapp ? parsed.data.whatsapp : undefined;
    const result = score({ responses, form, durationSeconds });
    const [pdf, institutePdf] = await Promise.all([
      renderResultsPdf({ result, locale, mode: "public", name }),
      env.copyTo && locale !== "en" ? renderResultsPdf({ result, locale: "en", mode: "public", name }) : undefined,
    ]);
    // Marketing: the live-session line only for people who opted in to hear from the institute (the core also drops it
    // for FLOODED). Built before anything is stored, so a failure here cannot leave a stored row without an email.
    const tm = await getTranslations({ locale, namespace: "marketing.email" });
    const personFooter = consent.newsletter ? liveSessionFooter(locale, (url) => tm("liveSession", { url })) : undefined;
    let deleteUrl: string | undefined;
    let registeredRef: string | null = null;
    let storedId: string | undefined;
    if (dbConfigured()) {
      const stored = await storePublicResult({ email, locale, form, responses, result, newsletter: consent.newsletter, policyVersion: consent.policyVersion });
      storedId = stored.id;
      deleteUrl = `${new URL(request.url).origin}/api/public/delete-result?token=${stored.deleteToken}&locale=${locale}`;
      if (attribution) registeredRef = (await saveResultAttribution(stored.id, attribution)).registeredRef;
    }
    // The number is unverified: it is kept and shown to the institute only once WhatsApp accepted a message to it.
    const whatsappSent = whatsapp ? await sendWhatsApp({ to: whatsapp, name, locale, pdf }) : null;
    await sendResultsEmail(
      { to: email, name, locale, pdf, institutePdf, patternTitle: getContent("en").patterns[result.pattern.key].title, flooded: result.pattern.key === "FLOODED", deleteUrl,
        instituteDetails: [...instituteDetails(attribution, registeredRef), ...(whatsapp && whatsappSent ? [{ label: "WhatsApp", value: whatsapp }] : [])], personFooter },
      env,
    );
    if (whatsapp && whatsappSent && storedId) {
      // Needs migration 0010. The email has gone out, so a missing column must not turn into a 502.
      await recordWhatsApp(storedId, whatsapp).catch((err: unknown) => console.error("whatsapp-results not recorded", { reason: err instanceof Error ? err.message : "unknown" }));
    }
    return NextResponse.json({ ok: true, copySentToInstitute: env.copyTo !== null, whatsappSent });
  } catch (err) {
    console.error("email-results failed", { reason: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "email_failed" }, { status: 502 });
  }
}

/** Best effort: the email already went out, so a WhatsApp failure is reported, not raised. */
async function sendWhatsApp(args: Parameters<typeof sendResultsWhatsApp>[0]): Promise<boolean> {
  const env = readWhatsAppEnv();
  if (!env) {
    console.error("whatsapp-results skipped", { reason: "not_configured" });
    return false;
  }
  // Limits must hold across instances: each send costs money and the number's reputation.
  if (!sharedLimiterConfigured()) {
    console.error("whatsapp-results skipped", { reason: "no_shared_limiter" });
    return false;
  }
  if (!(await rateLimit(recipientKey(args.to), 2, 24 * 60 * 60 * 1000)).ok) {
    console.error("whatsapp-results skipped", { reason: "recipient_rate_limited" });
    return false;
  }
  if (!(await rateLimit("wa:all", 100, 24 * 60 * 60 * 1000)).ok) {
    console.error("whatsapp-results skipped", { reason: "daily_cap" });
    return false;
  }
  try {
    await sendResultsWhatsApp(args, env);
    return true;
  } catch (err) {
    console.error("whatsapp-results failed", { reason: err instanceof Error ? err.message : "unknown" });
    return false;
  }
}
