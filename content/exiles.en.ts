/**
 * Exile theme content, English (DRAFT, all proposed). Warm, brief, no
 * biography, no instruction to go and meet the exile.
 */
import type { ExileKey } from "@/lib/scoring/types";

export interface ExileTheme {
  key: ExileKey;
  name: string;
  howItFeels: string;
  burdenBelief: string;
  whatItNeeds: string;
}

export const EXILE_SECTION_COPY = {
  intro:
    "These are young parts carrying old burdens. The burden is not who they are. In IFS we do not go to them directly: we first earn the trust of the protectors who stand guard over them. This is work for a held space, with a facilitator or therapist, not something to push into alone.",
  hidden:
    "Your answers show strong protectors and little exile feeling breaking through. In IFS this usually means the protection is working, not that nothing is being protected. There is nothing to chase here. Getting to know the protectors is the way in, when and if you choose.",
};

export const EXILES: Record<ExileKey, ExileTheme> = {
  SHAM: {
    key: "SHAM", name: "Not enough / Shame",
    howItFeels: "Collapse after small failures, wanting to hide, a sense of being defective.",
    burdenBelief: "\"Something is wrong with me.\"",
    whatItNeeds: "To be seen and accepted as it is.",
  },
  ABAN: {
    key: "ABAN", name: "Abandoned / Unlovable",
    howItFeels: "Ache or panic when someone withdraws, feeling not chosen.",
    burdenBelief: "\"I will be left. I cannot be loved as I am.\"",
    whatItNeeds: "To be stayed with.",
  },
  FEAR: {
    key: "FEAR", name: "Unsafe / Frightened",
    howItFeels: "Waves of fear, a small and frightened feeling, a body on alert.",
    burdenBelief: "\"I am not safe.\"",
    whatItNeeds: "Protection and a calm presence nearby.",
  },
  POWL: {
    key: "POWL", name: "Powerless / Unseen",
    howItFeels: "Freezing, feeling invisible or trapped, no voice.",
    burdenBelief: "\"What I want does not matter.\"",
    whatItNeeds: "To have a voice and to be defended.",
  },
  LONE: {
    key: "LONE", name: "Lonely / Grieving",
    howItFeels: "Old sadness, emptiness, longing for something never received.",
    burdenBelief: "\"I am alone with this.\"",
    whatItNeeds: "Company, and room to grieve.",
  },
};
