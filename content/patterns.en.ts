/**
 * Static copy for the six system patterns and two modifiers (English, DRAFT).
 * Part language only. No labels for the person. No "bad" results.
 */
import type { Band, ModifierKey, PatternKey, SelfBand } from "@/lib/scoring/types";

export const FRAMING =
  "This is a map of how your inner system is organised right now, not a label. Parts are not you. The real knowing comes from getting to know them.";

export const SELF_NOTE =
  "In IFS the Self is never damaged or missing. It is only more or less crowded out by parts that have had to work hard.";

export const CARE_NOTE =
  "If this brought up strong feelings, slow down and reach out to someone you trust or to a mental health professional. This tool is not a substitute for professional support.";

export const DISCLAIMER =
  "This is a self-report reflection tool. It is not a validated psychometric instrument, and it does not assess or identify any condition. Bands and thresholds are the school's heuristics, not norms.";

export const PATTERNS: Record<PatternKey, { title: string; body: string }> = {
  SELF_LED: {
    title: "Self is leading",
    body: "Right now your answers suggest that Self-energy is available most of the time and that no group of parts is running the system. Parts are still there, and some are active, but they seem to trust you enough to step back. This is a good moment to get to know them while things are calm.",
  },
  FLOODED: {
    title: "Exile feelings are breaking through",
    body: "Your answers suggest that old, tender feelings are surfacing often at the moment, more than the protectors can hold back. This is not a failure of any part. It usually means something is asking to be heard. Please go slowly, and let this be met in a held space rather than alone.",
  },
  REACTIVE: {
    title: "Firefighters are leading",
    body: "Your answers suggest that fast-acting protectors are taking the lead: parts that act quickly to switch off pain once it breaks through. They are working hard and their methods can be costly. They are not the problem; they are the response to something underneath.",
  },
  MANAGED: {
    title: "Managers are leading",
    body: "Your answers suggest that proactive protectors are organising daily life: parts that plan, check, please, control or keep distance so that tender places are never touched. They have probably been very effective. The cost tends to be effort, rigidity and a sense of not quite living.",
  },
  POLARISED: {
    title: "Managers and firefighters both strong",
    body: "Your answers suggest two groups of protectors working hard at the same time: some holding things together, others breaking free when the pressure becomes too much. Systems like this often feel like a tug-of-war. Both sides are trying to help, and both deserve curiosity.",
  },
  QUIET_OR_GUARDED: {
    title: "Quiet, or guarded",
    body: "Your answers show low activity across the system, with Self-energy not clearly available. This can mean a calm period. It can also mean that a part answered on your behalf, keeping things at a distance. Either is fine. You might get curious about which it is.",
  },
};

export const MODIFIERS: Record<ModifierKey, string> = {
  HIDDEN_EXILES:
    "Low exile scores alongside strong protectors usually mean the protection is working, not that nothing is being protected.",
  SELF_PRESENT:
    "Self-energy is available alongside the active parts. That is the best condition for getting to know them.",
};

export const BAND_LABELS: Record<Band, string> = {
  quiet: "quiet",
  present: "present",
  veryActive: "very active",
};

export const SELF_BAND_LABELS: Record<SelfBand, string> = {
  hardToReach: "hard to reach right now",
  availableAtTimes: "available at times",
  oftenAvailable: "often available",
};

export const GROUP_LABELS = {
  managers: "Managers",
  firefighters: "Firefighters",
  mixed: "Mixed role",
  exiles: "What is being protected",
  self: "Self",
} as const;

export const PAIRING_SENTENCE = (exileName: string) =>
  `In your answers, this protector appears alongside feelings of ${exileName}. It may be standing guard over them.`;
