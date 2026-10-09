/**
 * Every scoring threshold in one place. These values are heuristic, chosen
 * by the school, and are not norms. Never present them as norms in copy.
 */
export const SCORING_VERSION = "2026-09-18.1";

export const SCORING = {
  bands: {
    present: 2.5,
    veryActive: 3.5,
  },
  selfBands: {
    availableAtTimes: 2.5,
    oftenAvailable: 3.5,
  },
  pattern: {
    selfLedSelfMin: 3.5,
    selfLedLeadsMax: 3.0,
    floodedExileMin: 3.5,
    floodedMargin: 0.3,
    groupLeadMin: 3.0,
    groupLeadGap: 0.3,
    hiddenExilesMax: 2.5,
    selfPresentMin: 3.5,
  },
  leadingProtector: {
    min: 3.0,
    gap: 0.4,
    teamThirdGap: 0.4,
  },
  pairings: {
    protectorTopN: 3,
    exileMin: 2.5,
  },
  quality: {
    straightLiningShare: 0.9,
    minSecondsFull: 4 * 60,
    minSecondsShort: 3 * 60,
    acquiescenceSelfMin: 4.0,
    acquiescenceLoadMin: 4.0,
  },
  care: {
    exileLeadMin: 4.0,
  },
} as const;
