import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { pendingCohort } from "@/lib/actions/cohort";
import { userWithProfile } from "@/lib/actions/session";
import { ConsentForm } from "@/components/cohort/ConsentForm";

export const dynamic = "force-dynamic";

export default async function ConsentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await userWithProfile(locale);
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
