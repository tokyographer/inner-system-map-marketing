"use client";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/config/app";
import { getContent } from "@/content";
import type { CompletedAttempt } from "@/lib/questionnaire/storage";
import type { Result } from "@/lib/scoring/types";
import { CareNote } from "./CareNote";
import { ExilesSection } from "./ExilesSection";
import { MeetThisPart } from "./MeetThisPart";
import { ProgramInvite } from "./ProgramInvite";
import { ProtectorBars } from "./ProtectorBars";
import { ProtectorCards } from "./ProtectorCards";
import { ResultsActions } from "./ResultsActions";
import { RESULTS_SECTIONS, type ResultsSection } from "./sections";
import { SelfPanel } from "./SelfPanel";
import { WhoIsLeading } from "./WhoIsLeading";
import { ShareTheMap } from "@/marketing/components/ShareTheMap";

interface Props { result: Result; attempt: CompletedAttempt; mode: "public" | "cohort"; readOnly?: boolean }

export function ResultsView({ result, attempt, mode, readOnly = false }: Props) {
  const t = useTranslations("results");
  const content = getContent(useLocale() as Locale);
  const flooded = result.pattern.key === "FLOODED";
  const topProtector = result.protectors.ranked[0];

  const render: Record<ResultsSection, () => React.ReactNode> = {
    careNoteTop: () => (flooded ? <CareNote content={content} withResources /> : null),
    framing: () => <p className="text-lg">{content.framing}</p>,
    whoIsLeading: () => <WhoIsLeading result={result} content={content} />,
    self: () => <SelfPanel result={result} content={content} />,
    protectorProfile: () => <ProtectorBars result={result} content={content} />,
    protectorCards: () => <ProtectorCards result={result} content={content} />,
    exiles: () => <ExilesSection result={result} content={content} />,
    exercise: () => (readOnly ? null : <MeetThisPart protectorKey={topProtector} content={content} />),
    careNote: () => (flooded ? null : <CareNote content={content} withResources={false} />),
    // Marketing: "Share the map" shares the landing URL only; public mode, not when FLOODED.
    actions: () => (readOnly ? null : <><ResultsActions attempt={attempt} mode={mode} />{mode === "public" && !flooded && <div className="mt-10"><ShareTheMap /></div>}</>),
    levelTwo: () => (mode === "cohort" ? (
      <section aria-labelledby="lvl2" className="space-y-2 border-t border-line pt-6"><h2 id="lvl2" className="text-xl">{content.levelTwo.title}</h2><p>{content.levelTwo.body}</p></section>
    ) : null),
    invite: () => (mode === "public" && !flooded ? <ProgramInvite /> : null),
  };

  return (
    <article className={`space-y-12 py-10 ${flooded ? "[&_h2]:font-normal" : ""}`}>
      <h1 className="text-3xl">{t("title")}</h1>
      {RESULTS_SECTIONS.map((s) => <div key={s} data-section={s}>{render[s]()}</div>)}
      <p className="text-xs text-ink-muted">{content.disclaimer}</p>
    </article>
  );
}
