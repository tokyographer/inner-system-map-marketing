import { getTranslations } from "next-intl/server";
import { MIN_COMPLETED_FOR_AGGREGATES, type Locale } from "@/config/app";
import { getContent } from "@/content";
import type { Aggregate } from "@/lib/dashboard/aggregate";
import { EXILE_KEYS, PROTECTOR_KEYS, type PatternKey, type ProtectorKey } from "@/lib/scoring/types";
import { Bar } from "@/components/results/Bar";
import { toDisplay } from "@/lib/scoring/scales";

export async function AggregatePanel({ agg, locale }: { agg: Aggregate; locale: Locale }) {
  const t = await getTranslations("dashboard");
  const c = getContent(locale);
  if (agg.suppressed) return <p className="card card-warm p-4 text-sm">{t("aggregateHidden", { min: MIN_COMPLETED_FOR_AGGREGATES, n: agg.completed })}</p>;
  const pct = (n: number) => Math.round((n / agg.completed) * 100);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section className="card space-y-2 p-4">
        <h3 className="label">{t("patternDistribution")}</h3>
        {(Object.keys(agg.patterns) as PatternKey[]).map((k) => <Bar key={k} label={c.patterns[k].title} value={agg.patterns[k]} display={pct(agg.patterns[k])} band={`${pct(agg.patterns[k])}%`} color="var(--manager)" />)}
      </section>
      <section className="card space-y-2 p-4">
        <h3 className="label">{t("leadingProtectors")}</h3>
        {(Object.keys(agg.leadingProtectors) as ProtectorKey[]).filter((k) => agg.leadingProtectors[k] > 0).map((k) => <Bar key={k} label={c.typologies[k].name} value={agg.leadingProtectors[k]} display={pct(agg.leadingProtectors[k])} band={`${pct(agg.leadingProtectors[k])}%`} color="var(--firefighter)" />)}
      </section>
      <section className="card space-y-2 p-4 sm:col-span-2">
        <h3 className="label">{t("meanProfile")}</h3>
        <Bar label={t("meanSelf")} value={agg.meanSelf} display={toDisplay(agg.meanSelf)} band="" color="var(--self)" />
        {PROTECTOR_KEYS.map((k) => <Bar key={k} label={c.typologies[k].name} value={agg.meanScales[k]} display={toDisplay(agg.meanScales[k])} band="" color="var(--manager)" />)}
        {EXILE_KEYS.map((k) => <Bar key={k} label={c.exiles[k].name} value={agg.meanScales[k]} display={toDisplay(agg.meanScales[k])} band="" color="var(--exile)" />)}
        <p className="text-xs text-ink-muted">{t("careFlag")}: {agg.careFlags} / {agg.completed}</p>
      </section>
    </div>
  );
}
