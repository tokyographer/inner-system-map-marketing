"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CompletedAttempt, Contact } from "@/lib/questionnaire/storage";
import { markSent, useSentFor } from "@/lib/questionnaire/storage";
import { attributionRequestFields } from "@/marketing/attribution";

/** Public mode: sends the results to the address given at the start, once per attempt. */
export function AutoEmailStatus({ attempt, contact }: { attempt: CompletedAttempt; contact: Contact }) {
  const t = useTranslations("results");
  const locale = useLocale();
  const sentFor = useSentFor();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const started = useRef(false);

  async function send() {
    setStatus("sending");
    try {
      const res = await fetch("/api/public/email-results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: contact.email, name: contact.name, locale, form: attempt.form, responses: attempt.responses,
          durationSeconds: Math.round((attempt.completedAt - attempt.startedAt) / 1000), ageConfirmed: true,
          consent: { storeResults: true, newsletter: contact.newsletter, policyVersion: contact.policyVersion },
          ...attributionRequestFields(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      markSent(attempt.completedAt);
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  }

  const alreadySent = sentFor === attempt.completedAt;

  useEffect(() => {
    if (sentFor === undefined || alreadySent || started.current) return;
    started.current = true;
    void Promise.resolve().then(send);
  }, [sentFor, alreadySent]); // eslint-disable-line react-hooks/exhaustive-deps

  const email = contact.email;
  const shown = alreadySent ? "sent" : status;
  return (
    <div className="card card-warm p-4 text-sm" aria-live="polite">
      {shown === "sending" && <p role="status">{t("sendingTo", { email })}</p>}
      {shown === "sent" && <p role="status">{t("sentTo", { email })}</p>}
      {shown === "failed" && (
        <div className="flex flex-wrap items-center gap-3">
          <p role="alert">{t("sendFailed", { email })}</p>
          <button type="button" onClick={send} className="btn btn-outline">{t("sendAgain")}</button>
        </div>
      )}
    </div>
  );
}
