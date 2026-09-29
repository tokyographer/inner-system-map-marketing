import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/scoring/types";
import type { CompletedAttempt } from "@/lib/questionnaire/storage";
import { CohortResults } from "@/components/cohort/CohortResults";

export default async function CohortResultsPage({ params }: { params: Promise<{ locale: string; attemptId: string }> }) {
  const { locale, attemptId } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  const { data: a } = await supabase.from("attempts").select("*").eq("id", attemptId).single();
  if (!a) notFound();
  const { data: notes } = await supabase.from("participant_notes").select("protector_key, body, shared_with_facilitator").eq("attempt_id", attemptId);
  const result = a.scores as unknown as Result;
  const attempt: CompletedAttempt = { seed: Number(a.seed), form: a.form, startedAt: Date.parse(a.started_at), completedAt: Date.parse(a.completed_at), responses: a.responses as CompletedAttempt["responses"] };
  const note = notes?.find((n) => n.protector_key === result.protectors.ranked[0]);
  return <CohortResults attemptId={attemptId} result={result} attempt={attempt} noteBody={note?.body ?? ""} noteShared={note?.shared_with_facilitator ?? false} />;
}
