import { getTranslations, setRequestLocale } from "next-intl/server";
import { JoinForm } from "@/components/cohort/JoinForm";

export default async function JoinPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> }) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("cohort");
  return (
    <div className="space-y-6 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("joinTitle")}</h1>
      <p className="text-lg">{t("joinLead")}</p>
      <JoinForm initialError={error} />
    </div>
  );
}
