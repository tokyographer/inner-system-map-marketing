import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/dashboard/guard";
import { listCohorts } from "@/lib/dashboard/queries";
import { CreateCohortForm } from "@/components/dashboard/CreateCohortForm";
import { Forbidden } from "@/components/dashboard/Forbidden";

export const dynamic = "force-dynamic";

export default async function AdminCohorts({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const auth = await requireRole(["admin"]);
  if (!auth) return <Forbidden />;
  const t = await getTranslations("dashboard");
  const cohorts = await listCohorts(auth.user.id);
  return (
    <div className="space-y-8 py-10">
      <p className="eyebrow">{t("admin")}</p>
      <h1 className="text-[34px] sm:text-4xl">{t("allCohorts")}</h1>
      <ul className="divide-y divide-line">
        {cohorts.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <span>{c.name} <span className="text-ink-muted">· {c.level} · {c.language} · {c.completed}/{c.members} {t("completed")}{new Date(c.access_code_expires_at) < new Date() ? ` · ${t("code")} ${t("expired")}` : ""}</span></span>
            <span className="flex gap-3"><Link href={`/facilitator/cohorts/${c.id}`} className="label">{t("view")}</Link><Link href={`/admin/cohorts/${c.id}`} className="label">{t("facilitators")}</Link></span>
          </li>
        ))}
      </ul>
      <h2 className="text-2xl">{t("createCohort")}</h2>
      <CreateCohortForm />
      <Link href="/admin/audit" className="label">{t("audit")}</Link>
    </div>
  );
}
