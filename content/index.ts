/**
 * Locale-aware access to reviewed content. English is the master; ES and RO
 * are drafts pending human review (see the header of each file).
 */
import type { Locale } from "@/config/app";
import { EXILES, EXILE_SECTION_COPY, type ExileTheme } from "./exiles.en";
import { EXILES_ES, EXILE_SECTION_COPY_ES } from "./exiles.es";
import { EXILES_RO, EXILE_SECTION_COPY_RO } from "./exiles.ro";
import { EXILES_TR, EXILE_SECTION_COPY_TR } from "./exiles.tr";
import { BELIEF_FRAME, EXERCISE_INTRO, EXERCISE_STEPS, type ExerciseStep } from "./exercise.en";
import { BELIEF_FRAME_ES, EXERCISE_INTRO_ES, EXERCISE_STEPS_ES } from "./exercise.es";
import { BELIEF_FRAME_RO, EXERCISE_INTRO_RO, EXERCISE_STEPS_RO } from "./exercise.ro";
import { BELIEF_FRAME_TR, EXERCISE_INTRO_TR, EXERCISE_STEPS_TR } from "./exercise.tr";
import { ITEMS, type Item } from "./items.v2";
import { ITEM_TEXT_ES } from "./items.v2.es";
import { ITEM_TEXT_RO } from "./items.v2.ro";
import { ITEM_TEXT_TR } from "./items.v2.tr";
import { LEVEL_TWO } from "./level-two.en";
import { LEVEL_TWO_ES } from "./level-two.es";
import { LEVEL_TWO_RO } from "./level-two.ro";
import { LEVEL_TWO_TR } from "./level-two.tr";
import * as en from "./patterns.en";
import * as es from "./patterns.es";
import * as ro from "./patterns.ro";
import * as tr from "./patterns.tr";
import { EMAIL_LABELS, type EmailLabels } from "./email-labels";
import { PDF_LABELS, type PdfLabels } from "./pdf-labels";
import { SUPPORT_RESOURCES, type SupportResource } from "./support-resources.en";
import { SUPPORT_RESOURCES_ES } from "./support-resources.es";
import { SUPPORT_RESOURCES_RO } from "./support-resources.ro";
import { SUPPORT_RESOURCES_TR } from "./support-resources.tr";
import { MICRO_QUESTION, TYPOLOGIES, type Typology } from "./typologies.en";
import { MICRO_QUESTION_ES, TYPOLOGIES_ES } from "./typologies.es";
import { MICRO_QUESTION_RO, TYPOLOGIES_RO } from "./typologies.ro";
import { MICRO_QUESTION_TR, TYPOLOGIES_TR } from "./typologies.tr";
import type { Band, ExileKey, ModifierKey, PatternKey, ProtectorKey, SelfBand } from "@/lib/scoring/types";

export interface Content {
  locale: Locale;
  typologies: Record<ProtectorKey, Typology>;
  microQuestion: string;
  exiles: Record<ExileKey, ExileTheme>;
  exileSection: { intro: string; hidden: string };
  patterns: Record<PatternKey, { title: string; body: string }>;
  modifiers: Record<ModifierKey, string>;
  bandLabels: Record<Band, string>;
  selfBandLabels: Record<SelfBand, string>;
  groupLabels: { managers: string; firefighters: string; mixed: string; exiles: string; self: string };
  framing: string;
  selfNote: string;
  careNote: string;
  disclaimer: string;
  pairingSentence: (exileName: string) => string;
  exercise: { intro: string; steps: ExerciseStep[]; belief: typeof BELIEF_FRAME };
  support: SupportResource[];
  levelTwo: { title: string; body: string };
  pdf: PdfLabels;
  email: EmailLabels;
}

const CONTENT: Record<Locale, Content> = {
  en: {
    locale: "en", typologies: TYPOLOGIES, microQuestion: MICRO_QUESTION, exiles: EXILES, exileSection: EXILE_SECTION_COPY,
    patterns: en.PATTERNS, modifiers: en.MODIFIERS, bandLabels: en.BAND_LABELS, selfBandLabels: en.SELF_BAND_LABELS, groupLabels: en.GROUP_LABELS,
    framing: en.FRAMING, selfNote: en.SELF_NOTE, careNote: en.CARE_NOTE, disclaimer: en.DISCLAIMER, pairingSentence: en.PAIRING_SENTENCE,
    exercise: { intro: EXERCISE_INTRO, steps: EXERCISE_STEPS, belief: BELIEF_FRAME }, support: SUPPORT_RESOURCES, levelTwo: LEVEL_TWO, pdf: PDF_LABELS.en, email: EMAIL_LABELS.en,
  },
  es: {
    locale: "es", typologies: TYPOLOGIES_ES, microQuestion: MICRO_QUESTION_ES, exiles: EXILES_ES, exileSection: EXILE_SECTION_COPY_ES,
    patterns: es.PATTERNS_ES, modifiers: es.MODIFIERS_ES, bandLabels: es.BAND_LABELS_ES, selfBandLabels: es.SELF_BAND_LABELS_ES, groupLabels: es.GROUP_LABELS_ES,
    framing: es.FRAMING_ES, selfNote: es.SELF_NOTE_ES, careNote: es.CARE_NOTE_ES, disclaimer: es.DISCLAIMER_ES, pairingSentence: es.PAIRING_SENTENCE_ES,
    exercise: { intro: EXERCISE_INTRO_ES, steps: EXERCISE_STEPS_ES, belief: BELIEF_FRAME_ES }, support: SUPPORT_RESOURCES_ES, levelTwo: LEVEL_TWO_ES, pdf: PDF_LABELS.es, email: EMAIL_LABELS.es,
  },
  ro: {
    locale: "ro", typologies: TYPOLOGIES_RO, microQuestion: MICRO_QUESTION_RO, exiles: EXILES_RO, exileSection: EXILE_SECTION_COPY_RO,
    patterns: ro.PATTERNS_RO, modifiers: ro.MODIFIERS_RO, bandLabels: ro.BAND_LABELS_RO, selfBandLabels: ro.SELF_BAND_LABELS_RO, groupLabels: ro.GROUP_LABELS_RO,
    framing: ro.FRAMING_RO, selfNote: ro.SELF_NOTE_RO, careNote: ro.CARE_NOTE_RO, disclaimer: ro.DISCLAIMER_RO, pairingSentence: ro.PAIRING_SENTENCE_RO,
    exercise: { intro: EXERCISE_INTRO_RO, steps: EXERCISE_STEPS_RO, belief: BELIEF_FRAME_RO }, support: SUPPORT_RESOURCES_RO, levelTwo: LEVEL_TWO_RO, pdf: PDF_LABELS.ro, email: EMAIL_LABELS.ro,
  },
  tr: {
    locale: "tr", typologies: TYPOLOGIES_TR, microQuestion: MICRO_QUESTION_TR, exiles: EXILES_TR, exileSection: EXILE_SECTION_COPY_TR,
    patterns: tr.PATTERNS_TR, modifiers: tr.MODIFIERS_TR, bandLabels: tr.BAND_LABELS_TR, selfBandLabels: tr.SELF_BAND_LABELS_TR, groupLabels: tr.GROUP_LABELS_TR,
    framing: tr.FRAMING_TR, selfNote: tr.SELF_NOTE_TR, careNote: tr.CARE_NOTE_TR, disclaimer: tr.DISCLAIMER_TR, pairingSentence: tr.PAIRING_SENTENCE_TR,
    exercise: { intro: EXERCISE_INTRO_TR, steps: EXERCISE_STEPS_TR, belief: BELIEF_FRAME_TR }, support: SUPPORT_RESOURCES_TR, levelTwo: LEVEL_TWO_TR, pdf: PDF_LABELS.tr, email: EMAIL_LABELS.tr,
  },
};

export function getContent(locale: Locale): Content {
  return CONTENT[locale] ?? CONTENT.en;
}

const ITEM_TEXT: Record<Locale, Record<string, string> | null> = { en: null, es: ITEM_TEXT_ES, ro: ITEM_TEXT_RO, tr: ITEM_TEXT_TR };

/** Item text in the given locale, falling back to the English master. */
export function itemText(item: Item, locale: Locale): string {
  return ITEM_TEXT[locale]?.[item.id] ?? item.text;
}

export const ALL_ITEM_IDS = ITEMS.map((i) => i.id);
