"use client";
import { useTranslations } from "next-intl";
import { funnel } from "@/marketing/funnel";

export function ProgramInvite() {
  const t = useTranslations("invite");
  return (
    <section aria-labelledby="invite" className="space-y-2 border-t border-line pt-6">
      <h2 id="invite" className="text-xl">{t("title")}</h2>
      <p>{t("body")}</p>
      <a href="https://transcendentinstitute.com" rel="noopener" onClick={() => funnel("invite_click", { target: "program" })}>{t("link")}</a>
    </section>
  );
}
