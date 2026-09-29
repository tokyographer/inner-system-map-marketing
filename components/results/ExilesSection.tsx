"use client";
import { useTranslations } from "next-intl";
import { SCORING } from "@/config/scoring";
import type { Content } from "@/content";
import type { Result } from "@/lib/scoring/types";
import { Bar } from "./Bar";
import { useBandLabel } from "./ProtectorBars";

export function ExilesSection({ result, content }: { result: Result; content: Content }) {
  const t = useTranslations("results");
  const band = useBandLabel();
  const hidden = result.pattern.modifiers.includes("HIDDEN_EXILES");
  const active = result.exiles.ranked.filter((k) => result.scales[k].mean >= SCORING.pairings.exileMin);
  return (
    <section aria-labelledby="exiles" className="space-y-4">
      <h2 id="exiles" className="text-2xl">{t("exilesTitle")}</h2>
      <p>{content.exileSection.intro}</p>
      {hidden ? (
        <p className="card card-warm p-5">{content.exileSection.hidden}</p>
      ) : (
        <>
          <div className="space-y-2">
            {result.exiles.ranked.map((k) => <Bar key={k} label={content.exiles[k].name} value={result.scales[k].mean} display={result.scales[k].display} band={band(result.scales[k].band)} color="var(--exile)" />)}
          </div>
          {active.map((k) => (
            <article key={k} className="card space-y-1 p-4">
              <h3 className="text-lg">{content.exiles[k].name}</h3>
              <p><span className="font-semibold">{t("howItFeels")}: </span>{content.exiles[k].howItFeels}</p>
              <p><span className="font-semibold">{t("burden")}: </span>{content.exiles[k].burdenBelief}</p>
              <p><span className="font-semibold">{t("longsFor")}: </span>{content.exiles[k].whatItNeeds}</p>
            </article>
          ))}
        </>
      )}
    </section>
  );
}
