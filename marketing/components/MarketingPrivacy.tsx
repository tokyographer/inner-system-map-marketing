import { getTranslations } from "next-intl/server";

/** The marketing additions to the privacy notice, shown after the core sections. */
export async function MarketingPrivacy() {
  const t = await getTranslations("marketing.privacy");
  return (
    <section className="space-y-2">
      <h2 className="text-2xl">{t("heading")}</h2>
      <p className="text-sm text-ink-muted">{t("draft")}</p>
      <p>{t("attribution")}</p>
      <p>{t("analytics")}</p>
      <p>{t("partnerCounts")}</p>
    </section>
  );
}
