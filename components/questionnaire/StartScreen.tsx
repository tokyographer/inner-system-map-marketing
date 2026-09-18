"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_FORM } from "@/config/app";
import { useRouter } from "@/i18n/navigation";
import { newSeed } from "@/lib/questionnaire/order";
import { clearProgress, saveProgress, useProgress } from "@/lib/questionnaire/storage";

export function StartScreen() {
  const t = useTranslations("start");
  const tl = useTranslations("likert");
  const router = useRouter();
  const [age, setAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const existing = useProgress();

  function begin() {
    if (!age) { setError(t("ageRequired")); return; }
    clearProgress();
    saveProgress({ seed: newSeed(), form: DEFAULT_FORM.public, startedAt: Date.now(), index: 0, responses: {} });
    router.push("/questionnaire");
  }

  return (
    <div className="space-y-8 py-6">
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="text-lg">{t("instruction")}</p>
      <section className="rounded-lg border border-line bg-paper-2 p-4">
        <h2 className="mb-2 text-base font-sans font-semibold">{t("scaleTitle")}</h2>
        <ol className="grid gap-1 text-sm sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((v) => <li key={v}><span className="text-ink-muted">{v}</span> {tl(String(v))}</li>)}
        </ol>
      </section>
      <p className="text-sm text-ink-muted">{t("browser")}</p>

      {existing && Object.keys(existing.responses).length > 0 ? (
        <div className="space-y-3 rounded-lg border border-line p-4">
          <p>{t("resume")}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/questionnaire")} className="rounded-md bg-accent px-5 py-2 text-accent-ink">{t("continue")}</button>
            <button type="button" onClick={() => clearProgress()} className="rounded-md border border-line px-5 py-2">{t("startOver")}</button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); begin(); }} className="space-y-4" noValidate>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={age} onChange={(e) => { setAge(e.target.checked); setError(null); }} className="mt-1 h-5 w-5" aria-describedby={error ? "age-error" : undefined} />
            <span>{t("age")}</span>
          </label>
          {error && <p id="age-error" role="alert" className="text-sm text-focus">{error}</p>}
          <button type="submit" className="rounded-md bg-accent px-6 py-3 text-accent-ink">{t("start")}</button>
        </form>
      )}
    </div>
  );
}
