/**
 * Protector content, English. DRAFT translated from the Spanish master
 * (handout of 12 typologies) plus two proposed scales (DISS, IMPL).
 * `wound` is written in the tentative voice for display; `sourceWound`
 * keeps the original handout wording for reference only.
 */
import type { ProtectorKey } from "@/lib/scoring/types";

export interface Typology {
  key: ProtectorKey;
  name: string;
  role: string;
  proposed: boolean;
  triggers: string;
  visibleBehaviour: string;
  strategy: string;
  wound: string;
  sourceWound: string;
  cost: string;
  protectiveNeed: string;
}

export const MICRO_QUESTION =
  "What are you keeping me from feeling or remembering when you do this?";

export const TYPOLOGIES: Record<ProtectorKey, Typology> = {
  PERF: {
    key: "PERF", name: "Perfectionist / Demanding", role: "Manager", proposed: false,
    triggers: "Evaluation, mistakes, comparison, tasks with a high standard, public exposure.",
    visibleBehaviour: "Corrects, re-checks, does not hand things in, over-demands, looks for \"the perfect\".",
    strategy: "\"If I do it perfectly, I am safe.\"",
    wound: "Parts like this often protect a feeling of shame around mistakes, a sense of not being enough, and a fear of being humiliated or rejected.",
    sourceWound: "Vergüenza por error; \"no soy suficiente\"; miedo a humillación o rechazo.",
    cost: "Anxiety, rigidity, procrastination, little enjoyment, strain in relationships.",
    protectiveNeed: "Safety and acceptance through performance.",
  },
  CRIT: {
    key: "CRIT", name: "Critic / Judge", role: "Manager", proposed: false,
    triggers: "Vulnerability, feedback, inner doubt, one's own or other people's \"failures\".",
    visibleBehaviour: "Disqualifies, moralises, hardens the tone inside or out loud, points out flaws.",
    strategy: "Attack before being attacked: \"if I criticise you first, no one out there can hurt you.\"",
    wound: "Parts like this often protect an old experience of criticism or humiliation, and a younger part carrying shame and fear.",
    sourceWound: "Historia de crítica o humillación; exiliado con vergüenza y miedo.",
    cost: "Self-punishment, guilt, freezing, hostility, emotional distance.",
    protectiveNeed: "To avoid exposure and keep control.",
  },
  PLEA: {
    key: "PLEA", name: "Pleaser", role: "Manager", proposed: false,
    triggers: "Conflict, disapproval, authority figures, setting limits.",
    visibleBehaviour: "Says yes, adapts, avoids contradicting, takes on too much responsibility.",
    strategy: "Keep harmony to secure the bond.",
    wound: "Parts like this often protect a fear of being abandoned or rejected, and an early need to please in order to feel safe.",
    sourceWound: "Miedo a abandono o rechazo; necesidad temprana de agradar para estar seguro/a.",
    cost: "Resentment, exhaustion, a blurred sense of identity, weak boundaries.",
    protectiveNeed: "Belonging and relational safety.",
  },
  CTRL: {
    key: "CTRL", name: "Controller / Planner", role: "Manager", proposed: false,
    triggers: "Uncertainty, change, ambiguity, depending on someone else.",
    visibleBehaviour: "Rigid schedules, rules, supervises, corrects, anticipates scenarios.",
    strategy: "Predict and control in order to be safe.",
    wound: "Parts like this often protect a younger part that met unpredictability or chaos, and that carries fear and helplessness.",
    sourceWound: "Imprevisibilidad/caos temprano; exiliado con miedo e indefensión.",
    cost: "Chronic tension, irritability, rigidity, difficulty delegating.",
    protectiveNeed: "Stability and the prevention of harm.",
  },
  INTL: {
    key: "INTL", name: "Intellectualizer / Rationalizer", role: "Manager", proposed: false,
    triggers: "Intense emotion, intimacy, pain, guilt, ambivalence, emotional conversations.",
    visibleBehaviour: "Analyses, theorises, debates, explains; disconnects from the body.",
    strategy: "Turn emotion into thought to regulate intensity.",
    wound: "Parts like this often protect pain or shame that once felt like \"too much\", and a fear of being overwhelmed.",
    sourceWound: "Dolor/vergüenza \"demasiado\"; miedo a desbordarse.",
    cost: "Emotional disconnection, little intimacy, emptiness, difficulty asking for support.",
    protectiveNeed: "To avoid vulnerability and overflow; to keep clarity and certainty.",
  },
  AVOI: {
    key: "AVOI", name: "Avoider / Procrastinator", role: "Manager", proposed: false,
    triggers: "Tasks with a risk of failure, evaluation, decisions, important goals.",
    visibleBehaviour: "Postpones, gets distracted, avoids starting, seeks immediate relief.",
    strategy: "Avoid anxious activation and exposure to evaluation.",
    wound: "Parts like this often protect anticipated shame, a fear of failing, and a feeling of powerlessness.",
    sourceWound: "Vergüenza anticipada; miedo a fracasar; impotencia.",
    cost: "Guilt, lost opportunities, accumulated pressure, a damaged self-image.",
    protectiveNeed: "To reduce anxiety and protect from criticism.",
  },
  CARE: {
    key: "CARE", name: "Caretaker / Rescuer", role: "Manager", proposed: false,
    triggers: "Other people's suffering, guilt about setting limits, \"being selfish\".",
    visibleBehaviour: "Holds, saves, contains; puts others first; does not ask for help.",
    strategy: "Be useful to secure the bond and a sense of worth.",
    wound: "Parts like this often protect an early role of holding others up, and a fear of not being loved unless they contribute.",
    sourceWound: "Parentificación o rol temprano de sostén; miedo a no ser querido/a si no aporta.",
    cost: "Overload, exhaustion, one-sided relationships, resentment.",
    protectiveNeed: "To keep connection by being indispensable.",
  },
  HYPV: {
    key: "HYPV", name: "Hypervigilant / Anxious", role: "Manager", proposed: false,
    triggers: "Social ambiguity, signs of threat, news, symptoms, the other person's silence.",
    visibleBehaviour: "Ruminates, checks, seeks reassurance, anticipates the worst.",
    strategy: "Scan for danger and prepare a response.",
    wound: "Parts like this often protect a younger part that met insecurity or threat early on, and that carries a chronic fear.",
    sourceWound: "Inseguridad/amenaza temprana; exiliado con miedo crónico.",
    cost: "Insomnia, fatigue, tension, difficulty being present.",
    protectiveNeed: "To detect and prevent harm before it happens.",
  },
  DIST: {
    key: "DIST", name: "Distant / Self-sufficient", role: "Manager", proposed: false,
    triggers: "Emotional dependence, asking for help, deep intimacy, feeling \"needy\".",
    visibleBehaviour: "Cools down, withdraws, minimises needs, avoids intimate conversations.",
    strategy: "\"I do not need anyone\", so as not to suffer.",
    wound: "Parts like this often protect an attachment pain, a fear of abandonment or rejection, and of needing again without response.",
    sourceWound: "Dolor de apego; miedo a abandono/rechazo y a volver a necesitar sin respuesta.",
    cost: "Loneliness, little emotional nourishment, shallow bonds, difficulty receiving.",
    protectiveNeed: "To avoid relational vulnerability and keep inner control.",
  },
  NUMB: {
    key: "NUMB", name: "Soothing / Consuming", role: "Firefighter", proposed: false,
    triggers: "Pain, loneliness, shame, memories, conflict or a collapse of control.",
    visibleBehaviour: "Screens, food, substances, sex, overwork; anything that switches the feeling off fast.",
    strategy: "Numb quickly to bring the intensity down.",
    wound: "Parts like this often protect sadness, terror or loneliness that has been kept out of sight.",
    sourceWound: "Tristeza, terror o soledad exiliada.",
    cost: "Behavioural addiction, disconnection, health effects, problems in the couple.",
    protectiveNeed: "Immediate relief.",
  },
  DISS: {
    key: "DISS", name: "Checking out / Dissociating", role: "Firefighter (sometimes Manager)", proposed: true,
    triggers: "Overwhelm, conflict, painful memories, being looked at closely, intense emotion in the body.",
    visibleBehaviour: "Goes blank, foggy or far away; loses time; feels unreal or outside the body; cannot find words.",
    strategy: "Leave the scene inside when leaving outside is not possible.",
    wound: "Parts like this often protect terror or helplessness from moments that were too much and could not be escaped.",
    sourceWound: "Proposed scale; no handout source.",
    cost: "Lost time, absence in relationships, difficulty learning from experience, feeling unreal.",
    protectiveNeed: "Distance from what feels unbearable.",
  },
  ANGR: {
    key: "ANGR", name: "Protective anger / Explosive", role: "Firefighter", proposed: false,
    triggers: "Being invalidated, humiliation, external control, threat to boundaries or identity.",
    visibleBehaviour: "Attacks, sarcasm, intimidation, raises the volume, cuts the conversation.",
    strategy: "Recover power fast so as not to feel small.",
    wound: "Parts like this often protect helplessness and shame, and experiences of not being able to defend oneself.",
    sourceWound: "Indefensión y vergüenza; experiencias de no poder defenderse.",
    cost: "Relational damage, guilt afterwards, isolation, escalation.",
    protectiveNeed: "To restore limits and a sense of power.",
  },
  IMPL: {
    key: "IMPL", name: "Impulsive / Escaping", role: "Firefighter", proposed: true,
    triggers: "Feeling trapped, pressure, boredom that hides pain, shame rising.",
    visibleBehaviour: "Sudden exits, quitting, breaking off, spending, risk-taking, acting first and thinking later.",
    strategy: "Change the situation at once so the feeling stops.",
    wound: "Parts like this often protect a feeling of being trapped or powerless, with no say in what happens.",
    sourceWound: "Proposed scale; no handout source.",
    cost: "Broken commitments, financial or relational damage, regret, loss of others' trust.",
    protectiveNeed: "Freedom and immediate relief from pressure.",
  },
  REBL: {
    key: "REBL", name: "Rebel / Defiant", role: "Manager or Firefighter", proposed: false,
    triggers: "Rigid authority, imposed rules, feeling controlled or invaded.",
    visibleBehaviour: "Automatic opposition, provocation, \"you don't tell me what to do\", passive or active sabotage.",
    strategy: "Resist in order to recover autonomy and dignity.",
    wound: "Parts like this often protect a fear of being subdued, and a younger part carrying helplessness and held-back anger.",
    sourceWound: "Miedo a sometimiento; exiliado con indefensión y rabia contenida.",
    cost: "Chronic conflict, difficulty collaborating, isolation, lost opportunities.",
    protectiveNeed: "Autonomy, clear limits and respect.",
  },
};
