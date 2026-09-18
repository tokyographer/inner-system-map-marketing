"use client";
import { useTranslations } from "next-intl";
import type { Content } from "@/content";
import type { Result } from "@/lib/scoring/types";
import { toDisplay } from "@/lib/scoring/scales";
import { Bar } from "./Bar";
import { SystemDiagram } from "./SystemDiagram";

export function WhoIsLeading({ result, content }: { result: Result; content: Content }) {
  const t = useTranslations("results");
  const p = content.patterns[result.pattern.key];
  const selfBand = { hardToReach: t("selfHardToReach"), availableAtTimes: t("selfAvailableAtTimes"), oftenAvailable: t("selfOftenAvailable") }[result.self.band];
  return (
    <section aria-labelledby="who" className="space-y-5 rounded-lg border border-line p-5">
      <h2 id="who" className="text-2xl">{t("whoIsLeading")}</h2>
      <div className="grid gap-6 sm:grid-cols-[280px_1fr] sm:items-center">
        <SystemDiagram result={result} />
        <div className="space-y-3">
          <h3 className="text-xl">{p.title}</h3>
          <p>{p.body}</p>
          {result.pattern.modifiers.map((m) => <p key={m} className="text-sm text-ink-muted">{content.modifiers[m]}</p>)}
        </div>
      </div>
      <div className="space-y-2">
        <Bar label={t("self")} value={result.self.mean} display={result.self.display} band={selfBand} color="var(--self)" />
        <Bar label={t("managers")} value={result.leads.manager} display={toDisplay(result.leads.manager)} band="" color="var(--manager)" />
        <Bar label={t("firefighters")} value={result.leads.firefighter} display={toDisplay(result.leads.firefighter)} band="" color="var(--firefighter)" />
        <Bar label={t("exileFeelings")} value={result.leads.exile} display={toDisplay(result.leads.exile)} band="" color="var(--exile)" />
      </div>
    </section>
  );
}
