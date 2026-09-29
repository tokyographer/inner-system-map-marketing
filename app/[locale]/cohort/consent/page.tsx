import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { pendingCohort } from "@/lib/actions/cohort";
import { createClient } from "@/lib/supabase/server";
import { ConsentForm } from "@/components/cohort/ConsentForm";

export default async function ConsentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  const pending = await pendingCohort();
  if (!pending) redirect({ href: "/cohort/join?error=missing_code", locale });
  const t = await getTranslations("cohort");
  return (
    <div className="space-y-6 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("consentTitle")}</h1>
      <p className="text-lg">{t("consentLead", { cohort: pending!.name })}</p>
      <ConsentForm code={pending!.code} cohortName={pending!.name} />
    </div>
  );
}
