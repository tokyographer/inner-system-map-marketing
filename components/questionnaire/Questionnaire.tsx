"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/config/app";
import { itemText } from "@/content";
import { useRouter } from "@/i18n/navigation";
import { orderItems } from "@/lib/questionnaire/order";
import { clearProgress, saveAttempt, saveProgress, useProgress, type CompletedAttempt, type Progress } from "@/lib/questionnaire/storage";
import type { Response } from "@/lib/scoring/types";
import { LikertItem } from "./LikertItem";
import { ProgressBar } from "./ProgressBar";

const ADVANCE_DELAY_MS = 350;

interface Props {
  /** Called with the finished attempt in cohort mode; public mode stores it in the browser and navigates. */
  onComplete?: (attempt: CompletedAttempt) => Promise<boolean>;
}

export function Questionnaire({ onComplete }: Props = {}) {
  const t = useTranslations("questionnaire");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const progress = useProgress();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | null>(null);
  const finished = useRef(false);
  const form = progress?.form;
  const seed = progress?.seed;

  useEffect(() => { if (progress === null && !finished.current) router.replace("/start"); }, [progress, router]);

  const items = useMemo(() => (form && seed !== undefined ? orderItems(form, seed) : []), [form, seed]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  if (progress === undefined) return <p className="py-10 text-ink-muted" aria-live="polite">{t("loading")}</p>;
  if (!progress) return null;

  const index = Math.min(progress.index, items.length - 1);
  const item = items[index];
  const value = progress.responses[item.id];
  const isLast = index === items.length - 1;
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function update(next: Progress) { saveProgress(next); }

  function answer(v: Response) {
    setError(null);
    const next: Progress = { ...progress!, responses: { ...progress!.responses, [item.id]: v } };
    update(next);
    if (!isLast) {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => update({ ...next, index: index + 1 }), reduced ? 0 : ADVANCE_DELAY_MS);
    }
  }

  function back() {
    if (index === 0) return;
    if (timer.current) window.clearTimeout(timer.current);
    update({ ...progress!, index: index - 1 });
  }

  function forward() {
    if (!value) { setError(t("missing")); return; }
    if (isLast) {
      const missing = items.filter((it) => !progress!.responses[it.id]);
      if (missing.length > 0) {
        update({ ...progress!, index: items.indexOf(missing[0]) });
        setError(t("missing"));
        return;
      }
      const attempt: CompletedAttempt = { seed: progress!.seed, form: progress!.form, startedAt: progress!.startedAt, completedAt: Date.now(), responses: progress!.responses };
      if (onComplete) {
        setBusy(true);
        void onComplete(attempt).then((done) => { if (done) { finished.current = true; clearProgress(); } else { setBusy(false); } });
        return;
      }
      finished.current = true;
      saveAttempt(attempt);
      clearProgress();
      router.push("/results");
      return;
    }
    update({ ...progress!, index: index + 1 });
  }

  return (
    <div className="space-y-8 py-10">
      <ProgressBar current={index + 1} total={items.length} />
      <div key={item.id}>
        <LikertItem itemId={item.id} text={itemText(item, locale)} value={value} onChange={answer} />
      </div>
      {error && <p role="alert" className="text-sm text-interactive">{error}</p>}
      <div className="flex items-center justify-between">
        <button type="button" onClick={back} disabled={index === 0} className="btn btn-outline">{t("back")}</button>
        <button type="button" onClick={forward} disabled={busy} className="btn btn-primary">{isLast ? t("finish") : t("next")}</button>
      </div>
      <p className="text-xs text-ink-muted">{t("pause")}</p>
    </div>
  );
}
