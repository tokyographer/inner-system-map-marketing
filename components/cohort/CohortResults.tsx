"use client";
import type { CompletedAttempt } from "@/lib/questionnaire/storage";
import type { Result } from "@/lib/scoring/types";
import { ResultsView } from "@/components/results/ResultsView";
import { NoteEditor } from "./NoteEditor";

export function CohortResults({ attemptId, result, attempt, noteBody, noteShared }: { attemptId: string; result: Result; attempt: CompletedAttempt; noteBody: string; noteShared: boolean }) {
  return (
    <div className="space-y-8">
      <ResultsView result={result} attempt={attempt} mode="cohort" />
      <NoteEditor attemptId={attemptId} protectorKey={result.protectors.ranked[0]} initialBody={noteBody} initialShared={noteShared} />
    </div>
  );
}
