import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  return (
    <article className="space-y-8 py-6">
      <h1 className="text-3xl leading-tight sm:text-4xl">{t("title")}</h1>
      <p className="text-lg">{t("lead")}</p>
      <p>{t("ifs")}</p>
      <p>{t("notLabel")}</p>
      <p className="text-ink-muted">{t("time")}</p>
      <div>
        <Link href="/start" className="inline-block rounded-md bg-accent px-6 py-3 text-accent-ink hover:opacity-90">{t("begin")}</Link>
      </div>
      <section aria-label={t("privacy")} className="space-y-3 border-t border-line pt-6 text-sm text-ink-muted">
        <p>{t("disclaimer")}</p>
        <p>{t("program")}</p>
      </section>
    </article>
  );
}
