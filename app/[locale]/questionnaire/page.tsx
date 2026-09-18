import { setRequestLocale } from "next-intl/server";
import { Questionnaire } from "@/components/questionnaire/Questionnaire";

export default async function QuestionnairePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Questionnaire />;
}
