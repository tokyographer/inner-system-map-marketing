"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { saveCohortAttempt } from "@/lib/actions/cohort";
import type { CompletedAttempt } from "@/lib/questionnaire/storage";
import { Questionnaire } from "@/components/questionnaire/Questionnaire";

export function CohortQuestionnaire({ cohortId }: { cohortId: string }) {
  const t = useTranslations("cohort");
  const locale = useLocale();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function onComplete(a: CompletedAttempt): Promise<boolean> {
    setState("saving");
    const r = await saveCohortAttempt({ cohortId, locale, form: a.form, seed: a.seed, startedAt: a.startedAt, completedAt: a.completedAt, responses: a.responses });
    if (r.ok && r.data) { router.push(`/cohort/results/${r.data.attemptId}`); return true; }
    setState("error");
    return false;
  }

  return (
    <div>
      {state === "saving" && <p role="status" className="py-4 text-ink-muted">{t("saving")}</p>}
      {state === "error" && <p role="alert" className="py-4 text-interactive">{t("saveError")}</p>}
      <Questionnaire onComplete={onComplete} />
    </div>
  );
}
