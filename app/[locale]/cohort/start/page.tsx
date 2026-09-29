import { setRequestLocale } from "next-intl/server";
import { DEFAULT_FORM } from "@/config/app";
import { redirect } from "@/i18n/navigation";
import { currentUser } from "@/lib/auth/server";
import { StartScreen } from "@/components/questionnaire/StartScreen";

export const dynamic = "force-dynamic";

export default async function CohortStartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await currentUser())) redirect({ href: "/cohort/join", locale });
  return <StartScreen form={DEFAULT_FORM.cohort} questionnairePath="/cohort/questionnaire" />;
}
