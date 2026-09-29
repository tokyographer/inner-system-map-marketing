"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAttempt, type CompletedAttempt } from "@/lib/questionnaire/storage";
import { score } from "@/lib/scoring";
import type { Result } from "@/lib/scoring/types";
import { ResultsView } from "./ResultsView";

export function ResultsLoader({ mode }: { mode: "public" | "cohort" }) {
  const t = useTranslations("results");
  const attempt = useAttempt();
  const state = useMemo<{ attempt: CompletedAttempt; result: Result } | null | undefined>(() => {
    if (attempt === undefined) return undefined;
    if (!attempt) return null;
    try {
      const result = score({ responses: attempt.responses, form: attempt.form, durationSeconds: Math.round((attempt.completedAt - attempt.startedAt) / 1000) });
      return { attempt, result };
    } catch {
      return null;
    }
  }, [attempt]);

  if (state === undefined) return null;
  if (state === null) {
    return (
      <div className="space-y-4 py-10">
        <p>{t("empty")}</p>
        <Link href="/start" className="btn btn-primary no-underline">{t("takeIt")}</Link>
      </div>
    );
  }
  return <ResultsView result={state.result} attempt={state.attempt} mode={mode} />;
}
