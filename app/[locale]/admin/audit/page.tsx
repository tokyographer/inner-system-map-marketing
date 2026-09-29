import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireRole } from "@/lib/dashboard/guard";
import { listAudit } from "@/lib/dashboard/queries";
import { Forbidden } from "@/components/dashboard/Forbidden";

export const dynamic = "force-dynamic";

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const auth = await requireRole(["admin"]);
  if (!auth) return <Forbidden />;
  const t = await getTranslations("dashboard");
  const rows = await listAudit(auth.user.id);
  return (
    <div className="space-y-6 py-10">
      <p className="eyebrow">{t("admin")}</p>
      <h1 className="text-[34px] sm:text-4xl">{t("audit")}</h1>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t("audit")}>
        <table className="w-full min-w-[600px] text-sm">
          <thead><tr className="text-left">{[t("when"), t("actor"), t("action"), t("cohorts"), t("subject")].map((h) => <th key={h} className="label border-b border-line py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-line"><td className="py-2 pr-3">{new Date(r.at).toLocaleString(locale)}</td><td className="py-2 pr-3">{r.actor}</td><td className="py-2 pr-3">{r.action}</td><td className="py-2 pr-3 font-mono text-xs">{r.cohortId?.slice(0, 8) ?? "—"}</td><td className="py-2 font-mono text-xs">{r.subject?.slice(0, 8) ?? "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
