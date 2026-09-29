import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/dashboard/guard";
import { getCohort, listFacilitators } from "@/lib/dashboard/queries";
import { AssignFacilitatorForm } from "@/components/dashboard/AssignFacilitatorForm";
import { Forbidden } from "@/components/dashboard/Forbidden";

export const dynamic = "force-dynamic";

export default async function AdminCohort({ params }: { params: Promise<{ locale: string; cohortId: string }> }) {
  const { locale, cohortId } = await params;
  setRequestLocale(locale);
  if (!/^[0-9a-f-]{36}$/.test(cohortId)) notFound();
  const auth = await requireRole(["admin"]);
  if (!auth) return <Forbidden />;
  const cohort = await getCohort(auth.user.id, cohortId);
  if (!cohort) notFound();
  const t = await getTranslations("dashboard");
  const facilitators = await listFacilitators(auth.user.id, cohortId);
  return (
    <div className="space-y-8 py-10">
      <Link href={`/facilitator/cohorts/${cohortId}`} className="label">{t("backToCohort")}</Link>
      <h1 className="text-[34px] sm:text-4xl">{cohort.name}</h1>
      <section className="space-y-3">
        <h2 className="text-2xl">{t("facilitators")}</h2>
        {facilitators.length === 0 ? <p className="text-ink-muted">—</p> : <ul className="divide-y divide-line">{facilitators.map((f) => <li key={f.userId} className="py-2">{f.displayName ?? f.email ?? f.userId}{f.displayName && f.email ? <span className="text-ink-muted"> · {f.email}</span> : null}</li>)}</ul>}
        <AssignFacilitatorForm cohortId={cohortId} />
      </section>
    </div>
  );
}
