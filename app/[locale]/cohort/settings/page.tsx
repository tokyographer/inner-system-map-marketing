import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPanel } from "@/components/cohort/SettingsPanel";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  const t = await getTranslations("cohort");
  return (
    <div className="space-y-6 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("settings")}</h1>
      <SettingsPanel />
    </div>
  );
}
