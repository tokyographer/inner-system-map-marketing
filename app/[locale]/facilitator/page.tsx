import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/dashboard/guard";
import { listCohorts } from "@/lib/dashboard/queries";
import { Forbidden } from "@/components/dashboard/Forbidden";

export const dynamic = "force-dynamic";

export default async function FacilitatorHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const auth = await requireRole(["facilitator", "admin"]);
  if (!auth) return <Forbidden />;
  const t = await getTranslations("dashboard");
  const cohorts = await listCohorts(auth.user.id);
  return (
    <div className="space-y-6 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("title")}</h1>
      {auth.role === "admin" && <Link href="/admin/cohorts" className="label">{t("admin")}</Link>}
      <h2 className="text-2xl">{t("cohorts")}</h2>
      {cohorts.length === 0 ? <p className="text-ink-muted">{t("noCohorts")}</p> : (
        <ul className="divide-y divide-line">
          {cohorts.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span>{c.name} <span className="text-ink-muted">· {c.level} · {c.language} · {c.completed}/{c.members} {t("completed")}</span></span>
              <Link href={`/facilitator/cohorts/${c.id}`} className="label">{t("view")}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
