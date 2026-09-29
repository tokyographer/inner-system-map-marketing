"use client";
import { useTranslations } from "next-intl";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const t = useTranslations("questionnaire");
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-1">
      <p className="text-sm text-ink-muted">{t("progress", { current, total })}</p>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-label={t("progress", { current, total })} className="h-[3px] w-full bg-track">
        <div className="h-[3px] bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
