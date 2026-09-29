import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/config/app";
import { Link } from "@/i18n/navigation";
import { aggregate } from "@/lib/dashboard/aggregate";
import { requireRole } from "@/lib/dashboard/guard";
import { getCohort, listParticipants } from "@/lib/dashboard/queries";
import { AggregatePanel } from "@/components/dashboard/AggregatePanel";
import { CohortTable } from "@/components/dashboard/CohortTable";
import { Forbidden } from "@/components/dashboard/Forbidden";

export const dynamic = "force-dynamic";

export default async function CohortPage({ params }: { params: Promise<{ locale: string; cohortId: string }> }) {
  const { locale, cohortId } = await params;
  setRequestLocale(locale);
  if (!/^[0-9a-f-]{36}$/.test(cohortId)) notFound();
  const auth = await requireRole(["facilitator", "admin"]);
  if (!auth) return <Forbidden />;
  const cohort = await getCohort(auth.user.id, cohortId);
  if (!cohort) notFound();
  const t = await getTranslations("dashboard");
  const rows = await listParticipants(auth.user.id, cohortId);
  const agg = aggregate(rows);
  return (
    <div className="space-y-8 py-10">
      <p className="eyebrow">{t("cohorts")}</p>
      <h1 className="text-[34px] sm:text-4xl">{cohort.name}</h1>
      <p className="text-ink-muted">{cohort.level} · {cohort.language} · {agg.completed}/{rows.length} {t("completed")}</p>
      <section className="space-y-3"><h2 className="text-2xl">{t("participants")}</h2><CohortTable rows={rows} cohortId={cohortId} locale={locale as Locale} /></section>
      <section className="space-y-3"><h2 className="text-2xl">{t("aggregate")}</h2><AggregatePanel agg={agg} locale={locale as Locale} /></section>
      <div className="flex flex-wrap gap-3">
        <a href={`/api/facilitator/export/${cohortId}`} className="btn btn-outline no-underline">{t("exportCsv")}</a>
        {auth.role === "admin" && <a href={`/api/admin/export/${cohortId}`} className="btn btn-outline no-underline">{t("exportIdentified")}</a>}
        {auth.role === "admin" && <Link href={`/admin/cohorts/${cohortId}`} className="btn btn-outline no-underline">{t("facilitators")}</Link>}
      </div>
    </div>
  );
}
