import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LandingView } from "@/marketing/components/LandingView";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  return (
    <article className="space-y-8 py-10">
      <LandingView />
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 className="text-[38px] sm:text-5xl">{t("title")}</h1>
      <p className="text-lg">{t("lead")}</p>
      <p>{t("ifs")}</p>
      <p>{t("notLabel")}</p>
      <p className="text-ink-muted">{t("time")}</p>
      <div>
        <Link href="/start" className="btn btn-gold no-underline">{t("begin")}</Link>
      </div>
      <section aria-label={t("privacy")} className="space-y-3 border-t border-line pt-8 text-sm text-ink-muted">
        <p>{t("disclaimer")}</p>
        <p>{t("program")}</p>
      </section>
    </article>
  );
}
