import { getTranslations } from "next-intl/server";
import { getContent } from "@/content";
import type { Locale } from "@/config/app";
import { Link } from "@/i18n/navigation";
import type { ParticipantRow } from "@/lib/dashboard/aggregate";
import type { PatternKey } from "@/lib/scoring/types";

export async function CohortTable({ rows, cohortId, locale }: { rows: ParticipantRow[]; cohortId: string; locale: Locale }) {
  const t = await getTranslations("dashboard");
  const c = getContent(locale);
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t("participants")}>
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="text-left">
            {[t("participants"), t("status"), t("pattern"), t("self"), t("topProtectors"), t("topExile"), t("flags"), t("care"), ""].map((h, i) => <th key={i} className="label border-b border-line py-2 pr-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const res = r.latest?.result;
            return (
              <tr key={r.userId} className="border-b border-line align-top">
                <td className="py-2 pr-3">{r.displayName ?? r.pseudonym}<div className="text-xs text-ink-muted">{r.pseudonym} · {r.attemptCount} {t("attempts")}</div></td>
                <td className="py-2 pr-3">{res ? t("done") : t("notStarted")}</td>
                <td className="py-2 pr-3">{res ? c.patterns[res.pattern.key as PatternKey].title : "—"}</td>
                <td className="py-2 pr-3">{res ? res.self.display : "—"}</td>
                <td className="py-2 pr-3">{res ? res.protectors.ranked.slice(0, 3).map((k) => c.typologies[k].name.split(" / ")[0]).join(", ") : "—"}</td>
                <td className="py-2 pr-3">{res ? c.exiles[res.exiles.ranked[0]].name.split(" / ")[0] : "—"}</td>
                <td className="py-2 pr-3 text-xs">{res?.qualityFlags.join(", ") || "—"}</td>
                <td className="py-2 pr-3">{res?.careFlag ? <span className="card card-warm inline-block px-2 py-1 text-xs">{t("careFlag")}</span> : "—"}</td>
                <td className="py-2"><Link href={`/facilitator/cohorts/${cohortId}/participants/${r.userId}`} className="label">{t("view")}</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
