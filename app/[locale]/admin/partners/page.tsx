import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/dashboard/guard";
import { Forbidden } from "@/components/dashboard/Forbidden";
import { PartnerLinks } from "@/marketing/components/PartnerLinks";
import { RegisterPartnerForm } from "@/marketing/components/RegisterPartnerForm";
import { RemovePartnerButton } from "@/marketing/components/RemovePartnerButton";
import { listRefCounts, UNREGISTERED } from "@/marketing/server/funnel-counts";

export const dynamic = "force-dynamic";

/** Counts are client-reported and untrusted; never above 100%. */
const rate = (done: number, started: number) => (started > 0 ? `${Math.min(100, Math.round((done / started) * 100))}%` : "—");

/** Admin only: registered partner codes, their links, and starts and completions per code (marketing). */
export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const auth = await requireRole(["admin"]);
  if (!auth) return <Forbidden />;
  const t = await getTranslations("marketing.partners");
  const td = await getTranslations("dashboard");
  const rows = await listRefCounts(auth.user.id);
  const partners = rows.filter((r) => r.label !== null);
  const n = (v: number) => v.toLocaleString(locale);
  const name = (ref: string, label: string | null) => (label !== null ? <><span className="font-mono">{ref}</span> · {label}</> : <span className="text-ink-muted">{ref === UNREGISTERED ? t("unregistered") : t("noCode")}</span>);
  return (
    <div className="space-y-8 py-10">
      <p className="eyebrow">{td("admin")}</p>
      <h1 className="text-[34px] sm:text-4xl">{t("title")}</h1>
      <p>{t("intro")}</p>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t("title")}>
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="text-left">{[t("code"), t("starts30"), t("completions30"), t("starts"), t("completions"), t("rate")].map((h) => <th key={h} scope="col" className="label border-b border-line py-2 pr-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ref} className="border-b border-line">
                <th scope="row" className="py-2 pr-3 text-left font-normal">{name(r.ref, r.label)}</th>
                <td className="py-2 pr-3">{n(r.starts30)}</td><td className="py-2 pr-3">{n(r.completions30)}</td>
                <td className="py-2 pr-3">{n(r.starts)}</td><td className="py-2 pr-3">{n(r.completions)}</td><td className="py-2">{rate(r.completions, r.starts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-muted">{t("untrusted")}</p>
      {partners.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl">{t("links")}</h2>
          {partners.map((p) => <div key={p.ref} className="space-y-1"><p className="flex flex-wrap items-baseline gap-3 text-sm"><span>{name(p.ref, p.label)}</span><RemovePartnerButton code={p.ref} /></p><PartnerLinks code={p.ref} /></div>)}
        </section>
      )}
      <h2 className="text-2xl">{t("builderTitle")}</h2>
      <RegisterPartnerForm />
      <Link href="/admin/cohorts" className="label">{td("allCohorts")}</Link>
    </div>
  );
}
