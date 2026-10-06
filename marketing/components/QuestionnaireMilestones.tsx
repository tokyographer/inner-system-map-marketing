"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { funnel } from "../funnel";
import { crossesHalfway, milestoneAt } from "../milestones";

/** Public questionnaire only: a short encouragement at about a third and two thirds, and the `halfway` funnel event. */
export function QuestionnaireMilestones({ index, total }: { index: number; total: number }) {
  const t = useTranslations("marketing.milestones");
  const previous = useRef<number | null>(null);

  useEffect(() => {
    // The first render after a reload only records where the person is; it never counts as crossing halfway.
    if (previous.current !== null && crossesHalfway(previous.current, index, total)) funnel("halfway");
    previous.current = index;
  }, [index, total]);

  const milestone = milestoneAt(index, total);
  return (
    <div aria-live="polite" className="min-h-0">
      {milestone && <p role="status" className="card card-warm p-4 text-sm">{t(milestone)}</p>}
    </div>
  );
}
