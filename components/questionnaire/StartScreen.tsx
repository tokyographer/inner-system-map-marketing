"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_FORM, type Form } from "@/config/app";
import { useRouter } from "@/i18n/navigation";
import { newSeed } from "@/lib/questionnaire/order";
import { clearProgress, saveProgress, useProgress } from "@/lib/questionnaire/storage";

export function StartScreen({ form = DEFAULT_FORM.public, questionnairePath = "/questionnaire" }: { form?: Form; questionnairePath?: string } = {}) {
  const t = useTranslations("start");
  const tl = useTranslations("likert");
  const router = useRouter();
  const [age, setAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const existing = useProgress();

  function begin() {
    if (!age) { setError(t("ageRequired")); return; }
    clearProgress();
    saveProgress({ seed: newSeed(), form, startedAt: Date.now(), index: 0, responses: {} });
    router.push(questionnairePath);
  }

  return (
    <div className="space-y-8 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("title")}</h1>
      <p className="text-lg">{t("instruction")}</p>
      <section className="card card-warm p-5">
        <h2 className="label mb-3">{t("scaleTitle")}</h2>
        <ol className="grid gap-1 text-sm sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((v) => <li key={v}><span className="text-ink-muted">{v}</span> {tl(String(v))}</li>)}
        </ol>
      </section>
      <p className="text-sm text-ink-muted">{t("browser")}</p>

      {existing && Object.keys(existing.responses).length > 0 ? (
        <div className="card space-y-4 p-5">
          <p>{t("resume")}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push(questionnairePath)} className="btn btn-primary">{t("continue")}</button>
            <button type="button" onClick={() => clearProgress()} className="btn btn-outline">{t("startOver")}</button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); begin(); }} className="space-y-4" noValidate>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={age} onChange={(e) => { setAge(e.target.checked); setError(null); }} className="mt-1 h-5 w-5" aria-describedby={error ? "age-error" : undefined} />
            <span>{t("age")}</span>
          </label>
          {error && <p id="age-error" role="alert" className="text-sm text-interactive">{error}</p>}
          <button type="submit" className="btn btn-primary">{t("start")}</button>
        </form>
      )}
    </div>
  );
}
