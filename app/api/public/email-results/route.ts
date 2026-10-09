import { NextResponse } from "next/server";
import { WHATSAPP_RESULTS_READY } from "@/config/app";
import { getContent } from "@/content";
import { readEmailEnv, sendResultsEmail } from "@/lib/email/send-results";
import { renderResultsPdf } from "@/lib/pdf/render";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { score } from "@/lib/scoring";
import { emailRequestSchema } from "@/lib/validation/results-request";
import { storePublicResult } from "@/lib/public-results/store";
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
    if (dbConfigured()) {
      const stored = await storePublicResult({ email, locale, form, responses, result, newsletter: consent.newsletter, policyVersion: consent.policyVersion, whatsapp });
      deleteUrl = `${new URL(request.url).origin}/api/public/delete-result?token=${stored.deleteToken}&locale=${locale}`;
      if (attribution) registeredRef = (await saveResultAttribution(stored.id, attribution)).registeredRef;
    }
    await sendResultsEmail(
      { to: email, name, locale, pdf, institutePdf, patternTitle: getContent("en").patterns[result.pattern.key].title, flooded: result.pattern.key === "FLOODED", deleteUrl,
        instituteDetails: [...instituteDetails(attribution, registeredRef), ...(whatsapp ? [{ label: "WhatsApp", value: whatsapp }] : [])], personFooter },
      env,
    );
    const whatsappSent = whatsapp ? await sendWhatsApp({ to: whatsapp, name, locale, pdf }) : null;
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
  // Per recipient, on top of the per-client limit, so nobody can use the form to message strangers repeatedly.
  if (!(await rateLimit(recipientKey(args.to), 2, 24 * 60 * 60 * 1000)).ok) {
    console.error("whatsapp-results skipped", { reason: "recipient_rate_limited" });
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
