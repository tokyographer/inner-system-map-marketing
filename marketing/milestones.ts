/**
 * Encouragement while answering the public questionnaire: short messages at about a third and two thirds, and the
 * point at which the `halfway` funnel event is sent. Pure functions of the 0-based item index and the item count.
 */
export type Milestone = "third" | "twoThirds";

/** How many statements a milestone message stays visible for. */
export const MILESTONE_SPAN = 3;

const startOf = (total: number): Record<Milestone, number> => ({ third: Math.round(total / 3), twoThirds: Math.round((2 * total) / 3) });

/** The milestone message to show on this item, if any. */
export function milestoneAt(index: number, total: number): Milestone | null {
  if (total < 3 * MILESTONE_SPAN) return null;
  for (const [key, start] of Object.entries(startOf(total)) as [Milestone, number][]) {
    if (index >= start && index < start + MILESTONE_SPAN) return key;
  }
  return null;
}

/** True when moving from `previous` to `index` crosses the middle of the questionnaire (forward only). */
export function crossesHalfway(previous: number, index: number, total: number): boolean {
  const half = Math.floor(total / 2);
  return previous < half && index >= half;
}
