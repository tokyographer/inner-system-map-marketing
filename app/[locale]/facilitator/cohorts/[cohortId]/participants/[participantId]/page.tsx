import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/config/app";
import { getContent } from "@/content";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/dashboard/guard";
import { getParticipant } from "@/lib/dashboard/queries";
import type { CompletedAttempt } from "@/lib/questionnaire/storage";
import type { PatternKey, ProtectorKey } from "@/lib/scoring/types";
import { Forbidden } from "@/components/dashboard/Forbidden";
import { ResultsView } from "@/components/results/ResultsView";

export const dynamic = "force-dynamic";

export default async function ParticipantPage({ params }: { params: Promise<{ locale: string; cohortId: string; participantId: string }> }) {
  const { locale, cohortId, participantId } = await params;
  setRequestLocale(locale);
  if (!/^[0-9a-f-]{36}$/.test(cohortId) || !/^[0-9a-f-]{36}$/.test(participantId)) notFound();
  const auth = await requireRole(["facilitator", "admin"]);
  if (!auth) return <Forbidden />;
  const p = await getParticipant(auth.user.id, cohortId, participantId, "view_participant");
  if (!p) notFound();
  const t = await getTranslations("dashboard");
  const c = getContent(locale as Locale);
  const latest = p.attempts[0];
  const attempt: CompletedAttempt | null = latest ? { seed: 0, form: latest.result.form, startedAt: 0, completedAt: Date.parse(latest.completedAt), responses: {} } : null;
  return (
    <div className="space-y-8 py-10">
      <Link href={`/facilitator/cohorts/${cohortId}`} className="label">{t("backToCohort")}</Link>
      <h1 className="text-[34px] sm:text-4xl">{p.displayName ?? p.pseudonym}</h1>
      <p className="text-xs text-ink-muted">{t("accessLogged")}</p>
      <section className="space-y-3">
        <h2 className="text-2xl">{t("history")}</h2>
        {p.attempts.length === 0 ? <p className="text-ink-muted">{t("notStarted")}</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left"><th className="label border-b border-line py-2 font-medium">{t("date")}</th><th className="label border-b border-line py-2 font-medium">{t("pattern")}</th><th className="label border-b border-line py-2 font-medium">{t("self")}</th><th className="label border-b border-line py-2 font-medium">{t("topProtectors")}</th></tr></thead>
            <tbody>{p.attempts.map((a) => <tr key={a.id} className="border-b border-line"><td className="py-2">{new Date(a.completedAt).toLocaleDateString(locale)}</td><td className="py-2">{c.patterns[a.result.pattern.key as PatternKey].title}</td><td className="py-2">{a.result.self.display}</td><td className="py-2">{a.result.protectors.ranked.slice(0, 3).map((k: ProtectorKey) => c.typologies[k].name.split(" / ")[0]).join(", ")}</td></tr>)}</tbody></table>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl">{t("sharedNotes")}</h2>
        {p.notes.length === 0 ? <p className="text-ink-muted">{t("noSharedNotes")}</p> : p.notes.map((n) => <blockquote key={n.attemptId + n.protectorKey} className="card p-4 text-sm"><p className="label mb-2">{c.typologies[n.protectorKey as ProtectorKey]?.name} · {new Date(n.updatedAt).toLocaleDateString(locale)}</p><p className="whitespace-pre-wrap">{n.body}</p></blockquote>)}
      </section>
      {latest && attempt && (
        <section className="space-y-3 border-t border-line pt-8">
          <h2 className="text-2xl">{t("latest")}</h2>
          <ResultsView result={latest.result} attempt={attempt} mode="cohort" readOnly />
        </section>
      )}
    </div>
  );
}
