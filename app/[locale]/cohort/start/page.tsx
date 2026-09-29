import { setRequestLocale } from "next-intl/server";
import { DEFAULT_FORM } from "@/config/app";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { StartScreen } from "@/components/questionnaire/StartScreen";

export default async function CohortStartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  return <StartScreen form={DEFAULT_FORM.cohort} questionnairePath="/cohort/questionnaire" />;
}
