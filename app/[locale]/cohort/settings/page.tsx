import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { currentUser } from "@/lib/auth/server";
import { SettingsPanel } from "@/components/cohort/SettingsPanel";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await currentUser())) redirect({ href: "/cohort/join", locale });
  const t = await getTranslations("cohort");
  return (
    <div className="space-y-6 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("settings")}</h1>
      <SettingsPanel />
    </div>
  );
}
