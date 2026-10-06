/**
 * Sends the results PDF to the person, in their locale, and a copy to the
 * institute inbox entirely in English (body, subject and PDF). Two separate
 * sends so neither recipient sees the other in headers.
 * Never logs the payload, the email address or the responses.
 */
import { Resend } from "resend";
import { APP_NAME, PUBLIC_RESULTS_RETENTION_MONTHS, type Locale } from "@/config/app";
import { getContent } from "@/content";
import { fillTemplate } from "@/content/email-labels";
import { resultsPdfFilename } from "@/lib/pdf/filename";

export interface SendResultsArgs {
  to: string;
  name?: string;
  locale: Locale;
  /** Results PDF in the person's locale. */
  pdf: Buffer;
  /** English results PDF for the institute copy. Required unless locale is "en". */
  institutePdf?: Buffer;
  /** English pattern title, used only in the institute copy. */
  patternTitle: string;
  flooded: boolean;
  /** One-click deletion link for the stored copy (absent when no database is configured). */
  deleteUrl?: string;
}

export interface EmailEnv {
  apiKey: string;
  from: string;
  copyTo: string | null;
}

export function readEmailEnv(env: NodeJS.ProcessEnv = process.env): EmailEnv {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and RESEND_FROM in .env (see .env.example).");
  }
  return { apiKey, from, copyTo: env.RESULTS_COPY_TO?.trim() || null };
}

function bodyFor(args: SendResultsArgs, forInstitute: boolean): { subject: string; text: string } {
  const name = APP_NAME[args.locale];
  if (forInstitute) {
    const name = APP_NAME.en;
    return {
      subject: `[${name}] New results (${args.patternTitle})`,
      text: `A person completed the ${name} and consented to share results with the institute. The PDF is attached.\n\nName: ${args.name ?? "(not given)"}\nRecipient: ${args.to}\nLanguage: ${args.locale}\nPattern: ${args.patternTitle}${args.flooded ? "\nNote: pattern FLOODED. May benefit from extra support." : ""}`,
    };
  }
  const c = getContent(args.locale);
  const t = c.email;
  return {
    subject: fillTemplate(t.subject, { app: name }),
    text: [
      args.name ? fillTemplate(t.greetingNamed, { name: args.name }) : t.greeting,
      ``,
      fillTemplate(t.thanks, { app: name }),
      t.attached,
      ``,
      c.careNote,
      ``,
      args.deleteUrl
        ? fillTemplate(t.keptWithLink, { months: PUBLIC_RESULTS_RETENTION_MONTHS, url: args.deleteUrl })
        : t.keptReplyToDelete,
    ].join("\n"),
  };
}

export async function sendResultsEmail(args: SendResultsArgs, env: EmailEnv, client?: Resend): Promise<{ userId: string; copyId: string | null }> {
  const resend = client ?? new Resend(env.apiKey);
  const institutePdf = args.institutePdf ?? (args.locale === "en" ? args.pdf : null);
  if (env.copyTo && !institutePdf) throw new Error("Copy to institute needs an English PDF: pass institutePdf when locale is not en.");

  const user = bodyFor(args, false);
  const first = await resend.emails.send({ from: env.from, to: [args.to], subject: user.subject, text: user.text, attachments: [{ filename: resultsPdfFilename(args.locale, args.name), content: args.pdf }] });
  if (first.error) throw new Error(`Email to participant failed: ${first.error.message}`);

  let copyId: string | null = null;
  if (env.copyTo && institutePdf) {
    const inst = bodyFor(args, true);
    const second = await resend.emails.send({ from: env.from, to: [env.copyTo], subject: inst.subject, text: inst.text, attachments: [{ filename: resultsPdfFilename("en", args.name), content: institutePdf }] });
    if (second.error) throw new Error(`Copy to institute failed: ${second.error.message}`);
    copyId = second.data?.id ?? null;
  }
  return { userId: first.data?.id ?? "", copyId };
}
