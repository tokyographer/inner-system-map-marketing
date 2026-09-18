/**
 * Locale-aware access to reviewed content. ES and RO arrive in Phase 4;
 * until then every locale resolves to the English drafts.
 */
import type { Locale } from "@/config/app";
import { EXILES, EXILE_SECTION_COPY } from "./exiles.en";
import { BELIEF_FRAME, EXERCISE_INTRO, EXERCISE_STEPS } from "./exercise.en";
import { LEVEL_TWO } from "./level-two.en";
import * as patterns from "./patterns.en";
import { SUPPORT_RESOURCES } from "./support-resources.en";
import { MICRO_QUESTION, TYPOLOGIES } from "./typologies.en";

const en = {
  typologies: TYPOLOGIES,
  microQuestion: MICRO_QUESTION,
  exiles: EXILES,
  exileSection: EXILE_SECTION_COPY,
  patterns: patterns.PATTERNS,
  modifiers: patterns.MODIFIERS,
  framing: patterns.FRAMING,
  selfNote: patterns.SELF_NOTE,
  careNote: patterns.CARE_NOTE,
  disclaimer: patterns.DISCLAIMER,
  pairingSentence: patterns.PAIRING_SENTENCE,
  exercise: { intro: EXERCISE_INTRO, steps: EXERCISE_STEPS, belief: BELIEF_FRAME },
  support: SUPPORT_RESOURCES,
  levelTwo: LEVEL_TWO,
};

export type Content = typeof en;

export function getContent(locale: Locale): Content {
  void locale;
  return en;
}
