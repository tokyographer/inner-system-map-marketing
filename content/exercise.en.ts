/**
 * "Meet this part" exercise, addressed to a PROTECTOR only, never an exile.
 * PLACEHOLDER: step titles and copy follow the school's S.W.C.I.R. sequence.
 * Anthony supplies the final text. Do not change the structure.
 */
export interface ExerciseStep {
  key: "S" | "W" | "C" | "I" | "R";
  title: string;
  body: string;
}

export const EXERCISE_INTRO =
  "[PLACEHOLDER] A short, text-only reflection to bring to the protector named above. Go slowly. If at any point it feels like too much, stop and come back another day.";

export const EXERCISE_STEPS: ExerciseStep[] = [
  { key: "S", title: "[PLACEHOLDER] S — Step title", body: "[PLACEHOLDER] Step 1 copy. Notice where this part shows up in your body and how it speaks." },
  { key: "W", title: "[PLACEHOLDER] W — Step title", body: "[PLACEHOLDER] Step 2 copy. Ask the part what it is worried would happen if it stopped doing its job." },
  { key: "C", title: "[PLACEHOLDER] C — Step title", body: "[PLACEHOLDER] Step 3 copy. Notice the cost of the strategy, without judging the part for it." },
  { key: "I", title: "[PLACEHOLDER] I — Step title", body: "[PLACEHOLDER] Step 4 copy. Get curious about the intention behind the strategy." },
  { key: "R", title: "[PLACEHOLDER] R — Step title", body: "[PLACEHOLDER] Step 5 copy. Thank the part and ask what it would need from you to relax a little." },
];

export const BELIEF_FRAME = {
  intro: "If this part had a sentence it lives by, it might sound like this. Fill in what feels true.",
  template: ["I am not", "I must", "to be"],
  placeholder: ["...", "...", "..."],
  note: "What you write stays in your browser. It is not sent anywhere.",
};
