import { setRequestLocale } from "next-intl/server";
import { ResultsLoader } from "@/components/results/ResultsLoader";

export default async function ResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ResultsLoader mode="public" />;
}
