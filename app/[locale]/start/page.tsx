import { setRequestLocale } from "next-intl/server";
import { StartScreen } from "@/components/questionnaire/StartScreen";

export default async function StartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StartScreen collectContact />;
}
