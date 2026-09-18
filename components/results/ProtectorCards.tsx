"use client";
import { useTranslations } from "next-intl";
import type { Content } from "@/content";
import type { ProtectorKey, Result } from "@/lib/scoring/types";

function Field({ label, text }: { label: string; text: string }) {
  return <p><span className="font-semibold">{label}: </span>{text}</p>;
}

export function ProtectorCards({ result, content }: { result: Result; content: Content }) {
  const t = useTranslations("results");
  const top = result.protectors.ranked.slice(0, 3);
  return (
    <section aria-labelledby="cards" className="space-y-4">
      <h2 id="cards" className="text-2xl">{result.protectors.leading ? t("leadingProtector") : t("team")}</h2>
      {!result.protectors.leading && <p className="text-ink-muted">{t("teamNote")}</p>}
      {top.map((k: ProtectorKey) => {
        const ty = content.typologies[k];
        const linked = result.pairings.filter((p) => p.protector === k).map((p) => content.exiles[p.exile].name);
        return (
          <article key={k} className="space-y-3 rounded-lg border border-line p-5">
            <h3 className="text-xl">{ty.name} <span className="text-base text-ink-muted">· {ty.role}{ty.proposed ? ` · ${t("proposed")}` : ""}</span></h3>
            <Field label={t("howItShows")} text={ty.visibleBehaviour} />
            <Field label={t("triggers")} text={ty.triggers} />
            <div className="rounded-md bg-paper-2 p-3">
              <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("triangle")}</p>
              <Field label={t("strategy")} text={ty.strategy} />
              <Field label={t("wound")} text={linked.length ? `${ty.wound} ${content.pairingSentence(linked.join(" and "))}` : ty.wound} />
              <Field label={t("cost")} text={ty.cost} />
            </div>
            <Field label={t("protectiveNeed")} text={ty.protectiveNeed} />
            <p className="text-sm text-ink-muted"><span className="font-semibold">{t("microQuestion")}: </span>“{content.microQuestion}”</p>
          </article>
        );
      })}
    </section>
  );
}
