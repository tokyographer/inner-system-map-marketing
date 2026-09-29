import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ResultsDeletedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("deleted");
  return (
    <div className="space-y-6 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("title")}</h1>
      <p className="text-lg">{t("body")}</p>
      <Link href="/" className="btn btn-outline no-underline">{t("home")}</Link>
    </div>
  );
}
