/**
 * Item bank v2 (English master, DRAFT, pending clinical review by Anthony).
 * IDs are stable. `short: true` marks short-form items. `proposed: true`
 * marks scales new in this version. Never display scale or block names
 * during the questionnaire. No self-harm or suicidality items, by design.
 */
import type { Block, ScaleKey } from "@/lib/scoring/types";

export interface Item {
  id: string;
  scale: ScaleKey;
  block: Block;
  short: boolean;
  text: string;
}

export interface ScaleMeta {
  key: ScaleKey;
  block: Block;
  proposed: boolean;
}

export const ITEM_BANK_VERSION = "v2";

export const SCALES: ScaleMeta[] = [
  { key: "SELF", block: "self", proposed: false },
  { key: "PERF", block: "managers", proposed: false },
  { key: "CRIT", block: "managers", proposed: false },
  { key: "PLEA", block: "managers", proposed: false },
  { key: "CTRL", block: "managers", proposed: false },
  { key: "INTL", block: "managers", proposed: false },
  { key: "AVOI", block: "managers", proposed: false },
  { key: "CARE", block: "managers", proposed: false },
  { key: "HYPV", block: "managers", proposed: false },
  { key: "DIST", block: "managers", proposed: false },
  { key: "NUMB", block: "firefighters", proposed: false },
  { key: "DISS", block: "firefighters", proposed: true },
  { key: "ANGR", block: "firefighters", proposed: false },
  { key: "IMPL", block: "firefighters", proposed: true },
  { key: "REBL", block: "mixed", proposed: false },
  { key: "SHAM", block: "exiles", proposed: true },
  { key: "ABAN", block: "exiles", proposed: true },
  { key: "FEAR", block: "exiles", proposed: true },
  { key: "POWL", block: "exiles", proposed: true },
  { key: "LONE", block: "exiles", proposed: true },
];

const i = (scale: ScaleKey, block: Block, n: number, short: boolean, text: string): Item => ({
  id: `${scale}${n}`,
  scale,
  block,
  short,
  text,
});

export const ITEMS: Item[] = [
  // ── Self ────────────────────────────────────────────────────────────
  i("SELF", "self", 1, true, "When something upsets me, I can find my way back to calm."),
  i("SELF", "self", 2, true, "I can be curious about my reactions instead of judging them."),
  i("SELF", "self", 3, true, "I can feel compassion for the sides of me I do not like."),
  i("SELF", "self", 4, true, "Even under pressure, I can see clearly what matters."),
  i("SELF", "self", 5, true, "I can stay with a difficult feeling without being taken over by it."),
  i("SELF", "self", 6, true, "When two sides of me pull in different directions, I can listen to both."),
  i("SELF", "self", 7, false, "I trust myself to handle what life brings."),
  i("SELF", "self", 8, false, "I feel connected to other people and to life."),

  // ── Managers ────────────────────────────────────────────────────────
  i("PERF", "managers", 1, true, "I re-check or redo work that is already good enough."),
  i("PERF", "managers", 2, true, "I hold things back because they do not feel ready yet."),
  i("PERF", "managers", 3, true, "I set standards for myself that I would not ask of anyone else."),
  i("PERF", "managers", 4, false, "I find it hard to enjoy a result because I see what could have been better."),

  i("CRIT", "managers", 1, true, "An inner voice points out my flaws before anyone else can."),
  i("CRIT", "managers", 2, true, "When I receive feedback, I am harder on myself than the other person was."),
  i("CRIT", "managers", 3, true, "When I feel vulnerable, my tone becomes hard, inwardly or out loud."),
  i("CRIT", "managers", 4, false, "I notice other people's faults quickly and find it hard to let them go."),

  i("PLEA", "managers", 1, true, "I say yes when I want to say no."),
  i("PLEA", "managers", 2, true, "I soften or change my opinion to avoid disagreement."),
  i("PLEA", "managers", 3, true, "When someone is displeased with me, I cannot rest until it is repaired."),
  i("PLEA", "managers", 4, false, "Around authority figures I become more agreeable than I really am."),

  i("CTRL", "managers", 1, true, "Last-minute changes of plan unsettle me more than they seem to unsettle others."),
  i("CTRL", "managers", 2, true, "I run through possible scenarios in advance so nothing catches me off guard."),
  i("CTRL", "managers", 3, true, "I find it hard to delegate because it will not be done properly."),
  i("CTRL", "managers", 4, false, "I need clear structure and rules before I can relax."),

  i("INTL", "managers", 1, true, "When a conversation turns emotional, I start explaining or analyzing."),
  i("INTL", "managers", 2, true, "I can describe what I feel much better than I can actually feel it."),
  i("INTL", "managers", 3, true, "I need to understand why I feel something before I let myself feel it."),
  i("INTL", "managers", 4, false, "People close to me say I live in my head."),

  i("AVOI", "managers", 1, true, "I put off the tasks that matter most to me."),
  i("AVOI", "managers", 2, true, "When I face an important decision, I find something else to do."),
  i("AVOI", "managers", 3, true, "I stay away from situations where my performance will be evaluated."),
  i("AVOI", "managers", 4, false, "I only start when the deadline leaves me no choice."),

  i("CARE", "managers", 1, true, "I notice other people's needs before my own."),
  i("CARE", "managers", 2, true, "I feel guilty or selfish when I put myself first."),
  i("CARE", "managers", 3, true, "When someone is suffering, I feel it is up to me to fix it."),
  i("CARE", "managers", 4, false, "People bring me their problems, and I rarely bring them mine."),

  i("HYPV", "managers", 1, true, "When someone does not reply, I start imagining what went wrong."),
  i("HYPV", "managers", 2, true, "I scan people and situations for signs that something is off."),
  i("HYPV", "managers", 3, true, "My mind goes to the worst-case scenario."),
  i("HYPV", "managers", 4, false, "I check things more than once or look for reassurance."),

  i("DIST", "managers", 1, true, "When a relationship gets very close, I feel an urge to pull back."),
  i("DIST", "managers", 2, true, "I play down my needs, to myself and to others."),
  i("DIST", "managers", 3, true, "Receiving care or help makes me uncomfortable."),
  i("DIST", "managers", 4, false, "I tell myself I do not really need anyone."),

  // ── Firefighters ────────────────────────────────────────────────────
  i("NUMB", "firefighters", 1, true, "After a hard moment I reach for screens, food, a drink or something else to switch off."),
  i("NUMB", "firefighters", 2, true, "I go for quick relief even when I know it will cost me later."),
  i("NUMB", "firefighters", 3, true, "Once I start (scrolling, eating, drinking, working), I find it hard to stop."),
  i("NUMB", "firefighters", 4, false, "I keep myself busy so that I do not have to feel."),

  i("DISS", "firefighters", 1, true, "When painful feelings come up, I go flat or blank."),
  i("DISS", "firefighters", 2, true, "In tense situations I feel far away, as if I were watching from outside."),
  i("DISS", "firefighters", 3, true, "My mind goes foggy when a conversation touches something painful."),
  i("DISS", "firefighters", 4, false, "I realize I have been on autopilot for hours."),

  i("ANGR", "firefighters", 1, true, "When I feel dismissed or humiliated, I react fast and with force."),
  i("ANGR", "firefighters", 2, true, "My anger arrives faster than I can think."),
  i("ANGR", "firefighters", 3, true, "I use sarcasm or a raised voice to end a conversation."),
  i("ANGR", "firefighters", 4, false, "When someone crosses my boundaries, I go on the attack."),

  i("IMPL", "firefighters", 1, true, "When pressure builds, I make sudden decisions just to get out of it (quitting, leaving, ending things)."),
  i("IMPL", "firefighters", 2, true, "When I feel bad, I spend money or take risks on impulse."),
  i("IMPL", "firefighters", 3, true, "I do things in the heat of the moment that I cannot explain afterwards."),
  i("IMPL", "firefighters", 4, false, "When I feel trapped, I get the urge to drop everything and run."),

  // ── Mixed role ──────────────────────────────────────────────────────
  i("REBL", "mixed", 1, true, "When I am told what to do, I feel an immediate \"no\" inside."),
  i("REBL", "mixed", 2, true, "I resist even good suggestions if they feel like pressure."),
  i("REBL", "mixed", 3, true, "Rules that are imposed on me make me want to break them."),
  i("REBL", "mixed", 4, false, "When something is demanded of me, I quietly do not do it."),

  // ── Exiles (burden themes) ──────────────────────────────────────────
  i("SHAM", "exiles", 1, true, "A small failure can make me feel worthless."),
  i("SHAM", "exiles", 2, true, "There are moments when I feel that something is fundamentally wrong with me."),
  i("SHAM", "exiles", 3, true, "Deep down I doubt that I am enough."),
  i("SHAM", "exiles", 4, false, "I feel ashamed of who I am, not only of what I did."),

  i("ABAN", "exiles", 1, true, "When someone pulls away, I feel an ache that seems bigger than the situation."),
  i("ABAN", "exiles", 2, true, "I fear that people will leave once they really know me."),
  i("ABAN", "exiles", 3, true, "Deep down I doubt that I can be loved as I am."),
  i("ABAN", "exiles", 4, false, "I feel like the one who is left out or not chosen."),

  i("FEAR", "exiles", 1, true, "I get waves of fear without a clear reason in the present."),
  i("FEAR", "exiles", 2, true, "I suddenly feel small and frightened, like a child."),
  i("FEAR", "exiles", 3, true, "My body reacts as if I were in danger when nothing is actually happening."),
  i("FEAR", "exiles", 4, false, "A part of me feels that the world is not a safe place."),

  i("POWL", "exiles", 1, true, "I feel that what I want or say makes no difference."),
  i("POWL", "exiles", 2, true, "In some situations I freeze and cannot stand up for myself."),
  i("POWL", "exiles", 3, true, "I feel invisible, as if my needs did not count."),
  i("POWL", "exiles", 4, false, "I feel trapped, with no way to change things."),

  i("LONE", "exiles", 1, true, "I feel a deep loneliness even when I am with people."),
  i("LONE", "exiles", 2, true, "A sadness comes over me that feels older than my present life."),
  i("LONE", "exiles", 3, true, "I carry a longing for something I never received."),
  i("LONE", "exiles", 4, false, "I feel an emptiness inside that nothing quite fills."),
];

export function itemsForForm(form: "full" | "short"): Item[] {
  return form === "short" ? ITEMS.filter((it) => it.short) : ITEMS;
}
