"use client";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/config/app";
import { funnel } from "@/marketing/funnel";
import { liveSessionUrl, programInviteUrl } from "@/marketing/links";

/** Public results only, never for FLOODED (ResultsView decides). Links are per locale and tagged as coming from the map. */
export function ProgramInvite() {
  const t = useTranslations("invite");
  const tm = useTranslations("marketing.invite");
  const locale = useLocale() as Locale;
  const live = liveSessionUrl(locale);
  return (
    <section aria-labelledby="invite" className="space-y-2 border-t border-line pt-6">
      <h2 id="invite" className="text-xl">{t("title")}</h2>
      <p>{t("body")}</p>
      <p><a href={programInviteUrl(locale)} rel="noopener" onClick={() => funnel("invite_click", { target: "program" })}>{t("link")}</a></p>
      {live && (
        <p>{tm("liveSessionBody")} <a href={live} rel="noopener" onClick={() => funnel("invite_click", { target: "live_session" })}>{tm("liveSessionLink")}</a></p>
      )}
    </section>
  );
}
