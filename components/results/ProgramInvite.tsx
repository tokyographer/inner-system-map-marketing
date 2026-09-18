"use client";
import { useTranslations } from "next-intl";

export function ProgramInvite() {
  const t = useTranslations("invite");
  return (
    <section aria-labelledby="invite" className="space-y-2 border-t border-line pt-6">
      <h2 id="invite" className="text-xl">{t("title")}</h2>
      <p>{t("body")}</p>
      <a href="https://transcendentinstitute.com" className="underline" rel="noopener">{t("link")}</a>
    </section>
  );
}
