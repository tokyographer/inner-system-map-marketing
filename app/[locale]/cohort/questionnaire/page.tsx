import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CohortQuestionnaire } from "@/components/cohort/CohortQuestionnaire";

export default async function CohortQuestionnairePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  const { data: m } = await supabase.from("cohort_members").select("cohort_id").eq("user_id", user!.id).limit(1).single();
  if (!m) redirect({ href: "/cohort", locale });
  return <CohortQuestionnaire cohortId={m!.cohort_id} />;
}
