import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { currentUser } from "@/lib/auth/server";
import { withUser } from "@/lib/db";
import type { AttemptRow } from "@/lib/db/types";
import type { Result } from "@/lib/scoring/types";
import type { CompletedAttempt } from "@/lib/questionnaire/storage";
import { CohortResults } from "@/components/cohort/CohortResults";

export const dynamic = "force-dynamic";

export default async function CohortResultsPage({ params }: { params: Promise<{ locale: string; attemptId: string }> }) {
  const { locale, attemptId } = await params;
  setRequestLocale(locale);
  const user = await currentUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  if (!/^[0-9a-f-]{36}$/.test(attemptId)) notFound();
  const { a, notes } = await withUser(user!.id, async (db) => ({
    a: (await db.query<AttemptRow<Result, CompletedAttempt["responses"]>>("select * from public.attempts where id = $1", [attemptId])).rows[0],
    notes: (await db.query<{ protector_key: string; body: string; shared_with_facilitator: boolean }>("select protector_key, body, shared_with_facilitator from public.participant_notes where attempt_id = $1", [attemptId])).rows,
  }));
  if (!a) notFound();
  const result = a.scores;
  const attempt: CompletedAttempt = { seed: Number(a.seed), form: a.form, startedAt: Date.parse(a.started_at), completedAt: Date.parse(a.completed_at), responses: a.responses };
  const note = notes.find((n) => n.protector_key === result.protectors.ranked[0]);
  return <CohortResults attemptId={attemptId} result={result} attempt={attempt} noteBody={note?.body ?? ""} noteShared={note?.shared_with_facilitator ?? false} />;
}
