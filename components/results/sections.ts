/**
 * Canonical order of the results page (section 8). The results-order test
 * asserts the invariants: exiles after protectors, exercise on a protector.
 */
export const RESULTS_SECTIONS = [
  "careNoteTop",       // only when FLOODED
  "framing",
  "whoIsLeading",
  "self",
  "protectorProfile",
  "protectorCards",
  "exiles",
  "exercise",
  "careNote",
  "actions",
  "levelTwo",          // cohort mode only
  "invite",            // public mode, not when FLOODED
] as const;

export type ResultsSection = (typeof RESULTS_SECTIONS)[number];
