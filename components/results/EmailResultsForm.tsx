"use client";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PUBLIC_POLICY_VERSION } from "@/marketing/config";
import type { CompletedAttempt } from "@/lib/questionnaire/storage";
import { attributionRequestFields } from "@/marketing/attribution";

type Status = "idle" | "sending" | "sent" | "invalid" | "rate" | "unavailable" | "error";

export function EmailResultsForm({ attempt }: { attempt: CompletedAttempt }) {
  const t = useTranslations("email");
  const tStart = useTranslations("start");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [store, setStore] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!store || !name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("invalid"); return; }
    setStatus("sending");
    try {
      const res = await fetch("/api/public/email-results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), email, locale, form: attempt.form, responses: attempt.responses,
          durationSeconds: Math.round((attempt.completedAt - attempt.startedAt) / 1000),
          ageConfirmed: true,
          consent: { storeResults: true, newsletter, policyVersion: PUBLIC_POLICY_VERSION },
          ...attributionRequestFields(),
        }),
      });
      if (res.ok) setStatus("sent");
      else if (res.status === 429) setStatus("rate");
      else if (res.status === 503) setStatus("unavailable");
      else if (res.status === 400) setStatus("invalid");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const message: Partial<Record<Status, string>> = {
    sent: t("sent"), invalid: tStart("contactRequired"), rate: t("errorRate"), unavailable: t("errorUnavailable"), error: t("errorGeneric"),
  };

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-5">
      <h3 className="text-lg">{t("title")}</h3>
      <p className="text-sm text-ink-muted">{t("lead")}</p>
      <label className="block text-sm">
        {tStart("name")}
        <input type="text" autoComplete="name" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2 focus:border-interactive" required />
      </label>
      <label className="block text-sm">
        {t("email")}
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2 focus:border-interactive" required />
      </label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={store} onChange={(e) => setStore(e.target.checked)} className="mt-1 h-5 w-5" required /><span>{t("storeConsent")}</span></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-1 h-5 w-5" /><span>{t("newsletter")}</span></label>
      <button type="submit" disabled={status === "sending" || status === "sent"} className="btn btn-primary">{status === "sending" ? t("sending") : t("send")}</button>
      {message[status] && <p role={status === "sent" ? "status" : "alert"} className="text-sm">{message[status]}</p>}
    </form>
  );
}
