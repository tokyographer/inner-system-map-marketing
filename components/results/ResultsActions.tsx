"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/config/app";
import { useRouter } from "@/i18n/navigation";
import { resultsPdfFilename } from "@/lib/pdf/filename";
import { clearAttempt, clearContact, clearProgress, useContact, type CompletedAttempt } from "@/lib/questionnaire/storage";
import { AutoEmailStatus } from "./AutoEmailStatus";
import { EmailResultsForm } from "./EmailResultsForm";

export function ResultsActions({ attempt, mode }: { attempt: CompletedAttempt; mode: "public" | "cohort" }) {
  const t = useTranslations("results");
  const locale = useLocale();
  const router = useRouter();
  const [pdf, setPdf] = useState<"idle" | "busy" | "error">("idle");
  const contact = useContact();

  async function download() {
    setPdf("busy");
    try {
      const res = await fetch("/api/public/results-pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, form: attempt.form, responses: attempt.responses, durationSeconds: Math.round((attempt.completedAt - attempt.startedAt) / 1000), ageConfirmed: true, name: contact?.name }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url; a.download = resultsPdfFilename(locale as Locale, contact?.name); a.click();
      URL.revokeObjectURL(url);
      setPdf("idle");
    } catch {
      setPdf("error");
    }
  }

  function retake() {
    if (!window.confirm(t("retakeConfirm"))) return;
    clearAttempt(); clearProgress(); clearContact();
    router.push("/start");
  }

  return (
    <section aria-labelledby="actions" className="space-y-4">
      <h2 id="actions" className="text-2xl">{t("actions")}</h2>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={download} disabled={pdf === "busy"} className="btn btn-primary">{pdf === "busy" ? t("downloading") : t("download")}</button>
        <button type="button" onClick={retake} className="btn btn-outline">{t("retake")}</button>
      </div>
      {pdf === "error" && <p role="alert" className="text-sm">{t("downloadError")}</p>}
      {mode === "public" && (contact ? <AutoEmailStatus attempt={attempt} contact={contact} /> : contact === null ? <EmailResultsForm attempt={attempt} /> : null)}
    </section>
  );
}
