import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { currentUser } from "@/lib/auth/server";
import { withUser } from "@/lib/db";
import { CohortQuestionnaire } from "@/components/cohort/CohortQuestionnaire";

export const dynamic = "force-dynamic";

export default async function CohortQuestionnairePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await currentUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  const m = await withUser(user!.id, async (db) => (await db.query<{ cohort_id: string }>("select cohort_id from public.cohort_members where user_id = $1 limit 1", [user!.id])).rows[0]);
  if (!m) redirect({ href: "/cohort", locale });
  return <CohortQuestionnaire cohortId={m!.cohort_id} />;
}
