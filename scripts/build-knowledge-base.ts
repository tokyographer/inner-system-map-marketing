/**
 * Builds docs/KNOWLEDGE-BASE.md from the live content and scoring config, so
 * the document can never drift from the app. Run: npm run docs:kb
 */
import { writeFileSync } from "node:fs";
import { APP_NAME, DEFAULT_FORM, LOCALES, MIN_COMPLETED_FOR_AGGREGATES, PUBLIC_RESULTS_RETENTION_MONTHS, COHORT_RETENTION_MONTHS } from "../config/app";
import { SCORING, SCORING_VERSION } from "../config/scoring";
import { ITEMS, ITEM_BANK_VERSION, SCALES, itemsForForm } from "../content/items.v2";
import { PAIRINGS } from "../content/pairings";
import { TYPOLOGIES, MICRO_QUESTION } from "../content/typologies.en";
import { EXILES, EXILE_SECTION_COPY } from "../content/exiles.en";
import { PATTERNS, MODIFIERS, FRAMING, SELF_NOTE, CARE_NOTE, DISCLAIMER, BAND_LABELS, SELF_BAND_LABELS } from "../content/patterns.en";
import { LEVEL_TWO } from "../content/level-two.en";
import { EXILE_KEYS, FIREFIGHTER_KEYS, MANAGER_KEYS, MIXED_KEYS, PROTECTOR_KEYS, type ExileKey, type ProtectorKey, type ScaleKey } from "../lib/scoring/types";

const SCALE_NAME: Record<ScaleKey, string> = {
  SELF: "Self-leadership",
  ...Object.fromEntries(PROTECTOR_KEYS.map((k) => [k, TYPOLOGIES[k].name])),
  ...Object.fromEntries(EXILE_KEYS.map((k) => [k, EXILES[k].name])),
} as Record<ScaleKey, string>;

const lines: string[] = [];
const h = (level: number, text: string) => lines.push("", `${"#".repeat(level)} ${text}`, "");
const p = (text: string) => lines.push(text, "");
const table = (headers: string[], rows: (string | number)[][]) => {
  lines.push(`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`);
  rows.forEach((r) => lines.push(`| ${r.map((c) => String(c).replace(/\|/g, "\\|")).join(" | ")} |`));
  lines.push("");
};

h(1, `${APP_NAME.en}: knowledge base`);
p(`Generated ${new Date().toISOString().slice(0, 10)} from the application's own content files (item bank ${ITEM_BANK_VERSION}, scoring rules ${SCORING_VERSION}). This document is the reference for anyone, human or AI, writing training material, presentations, manuals or support answers about the test. Where this document and the app differ, regenerate this document; the app is the source.`);
p("Names in other languages: " + LOCALES.filter((l) => l !== "en").map((l) => `${l.toUpperCase()} “${APP_NAME[l]}”`).join(", ") + ".");

h(2, "1. What the test is");
p("The Inner System Map is a self-report reflection tool built for Transcendent Institute, a school teaching a Self Leadership Program that integrates the psychology of Internal Family Systems (IFS) with Kabbalah, Yoga and Andean tradition. The test maps how a person's inner system is organised right now: how much Self-leadership is available, which group of parts is currently leading (Managers, Firefighters or Exiles), and which specific parts are most active within each group.");
p("It is a screener that generates hypotheses for reflection and for facilitated work. It is not a validated psychometric instrument, not a diagnostic tool, not therapy, not a quick fix and not a religion. These limits are stated on the landing page and on every results page, and all bands and thresholds are the school's heuristics, never norms.");
p("Two modes exist. Public mode is the lead tool on the school's website: anyone over 18 can take it; answers are scored in the browser; the person gives a name and email at the start and receives the results as a PDF, with a copy to the institute. Cohort mode is for program participants: they join with an access code from their facilitator, sign in by an emailed code, consent explicitly to storage and facilitator visibility, and their attempts are kept with history; facilitators see a dashboard.");

h(2, "2. Theoretical framing the test must respect");
p("Source theory: Richard C. Schwartz, Internal Family Systems Therapy (Guilford, 1995); Schwartz and Sweezy, Internal Family Systems Therapy, 2nd ed. (Guilford, 2020); Schwartz, No Bad Parts (Sounds True, 2021). Measurement precedent: DeLand, Strongin and Schwartz (2006), the IFS Scale, from which no items were copied.");
[
  ["The model", "The mind is a system of parts plus a core Self. The Self is undamaged in everyone and is the natural leader; when it does not lead it is constrained by parts, not defective. Parts take on three roles. Exiles are young, vulnerable parts carrying burdens (pain, shame, fear, worthlessness, loneliness), kept out of awareness. Managers protect proactively, organising daily life so exiles are never triggered. Firefighters protect reactively, acting fast once exile pain breaks through, whatever the cost. Manager, Firefighter and Exile are roles a part was forced into, not its nature."],
  ["IFS does not type people", "Nobody is “a Perfectionist”. All copy uses part language: “a part of you that…”, never “you are a…”. Results are a map of a system, never a label."],
  ["No bad parts", "Every protector formed for a reason; every exile carries something that was not its fault. Tone toward every part is respectful and curious. No result is bad."],
  ["Blending is what “leading” means", "A part leads when it blends with the person and acts in place of the Self. The test reports which parts most often take the lead and how much Self-leadership is available alongside them. Self is measured as its own dimension, not as the absence of parts."],
  ["Exiles are hidden by definition", "Self-report can only detect exiles when they break through. A high exile score means exile feelings are flooding often. A low exile score with strong protectors does not mean there are no exiles; it more likely means the protectors are succeeding. The results say this."],
  ["Hypotheses, not verdicts", "Real knowing comes from turning toward a part and asking what it protects and fears. Exiles are approached only with the permission of their protectors. The app never invites the person to go to an exile directly; the one exercise addresses the leading protector only."],
  ["Program context", "In the Self Leadership Program the tool belongs to Level II, Balance, which works with the Sefirah Yesod and the Andean Jaguar of Kay Pacha. The Self corresponds, in the school's synthesis, to Tiferet. This is presented as the school's interpretive synthesis, not as a claim IFS or those traditions make."],
].forEach(([t, b]) => p(`**${t}.** ${b}`));
p(`Level II text shown to cohort participants: “${LEVEL_TWO.body}”`);

h(2, "3. Structure of the instrument");
table(["Block", "Scales", "Items (full)", "Items (short)"], [
  ["Self", "SELF", itemsForForm("full").filter((i) => i.scale === "SELF").length, itemsForForm("short").filter((i) => i.scale === "SELF").length],
  ["Managers", MANAGER_KEYS.join(", "), MANAGER_KEYS.length * 4, MANAGER_KEYS.length * 3],
  ["Firefighters", FIREFIGHTER_KEYS.join(", "), FIREFIGHTER_KEYS.length * 4, FIREFIGHTER_KEYS.length * 3],
  ["Mixed role", MIXED_KEYS.join(", "), 4, 3],
  ["Exiles (burden themes)", EXILE_KEYS.join(", "), EXILE_KEYS.length * 4, EXILE_KEYS.length * 3],
  ["Total", "20 scales", ITEMS.length, itemsForForm("short").length],
]);
p(`Two forms share one item bank. The full form (${ITEMS.length} items) is the default in cohort mode (${DEFAULT_FORM.cohort}); the short form (${itemsForForm("short").length} items, marked below) is the default in public mode (${DEFAULT_FORM.public}). Scoring works on whichever items were answered.`);
p("Response scale, frequency based, five points: 1 Never or almost never, 2 Rarely, 3 Sometimes, 4 Often, 5 Almost always. Instruction shown before starting: “Answer for how you have actually been over the last 6 months, not how you would like to be. There are no right answers. Go with your first response. Some statements touch tender places. You can pause or stop at any time.”");
p("Item order is randomised per attempt with two constraints: two items from the same scale never appear consecutively, and no more than two exile items appear in any run of five. The seed is stored so an order can be reproduced. Scale and block names are never shown during the questionnaire. One item per screen with auto-advance, a progress bar and a back button; progress is saved on the device so a refresh loses nothing. Every item must be answered.");
p("Deliberate exclusion: there is no self-harm or suicidality scale. A public self-report tool with no clinician in the loop must not screen for this.");
p("Scales marked “proposed” were added in version 2 so that firefighters and exiles can be measured as groups; they have no source in the school's original handout and await clinical review: " + SCALES.filter((s) => s.proposed).map((s) => s.key).join(", ") + ".");

h(2, "4. The item bank (English master)");
p("Asterisk = short-form item. Item IDs are stable and scoring never depends on wording; translations in Spanish, Romanian and Turkish are keyed by ID.");
for (const block of ["self", "managers", "firefighters", "mixed", "exiles"] as const) {
  h(3, { self: "Block A. Self", managers: "Block B. Managers", firefighters: "Block C. Firefighters", mixed: "Block D. Mixed role", exiles: "Block E. Exiles (burden themes)" }[block]);
  for (const s of SCALES.filter((s) => s.block === block)) {
    lines.push(`**${s.key}. ${SCALE_NAME[s.key]}**${s.proposed ? " (proposed)" : ""}`);
    ITEMS.filter((i) => i.scale === s.key).forEach((i) => lines.push(`- ${i.id}${i.short ? "*" : ""} ${i.text}`));
    lines.push("");
  }
}

h(2, "5. Scoring rules");
p("All thresholds live in one configuration object and are heuristic. They are listed here so trainers can explain a result; they must never be presented as norms.");
h(3, "5.1 Scale scores and bands");
p("Scale score = mean of its items, 1.0 to 5.0. Display value 0 to 100 = (mean − 1) / 4 × 100.");
table(["Band", "Part scales", "Self"], [
  [`below ${SCORING.bands.present}`, BAND_LABELS.quiet, SELF_BAND_LABELS.hardToReach],
  [`${SCORING.bands.present} to ${SCORING.bands.veryActive - 0.01}`, BAND_LABELS.present, SELF_BAND_LABELS.availableAtTimes],
  [`${SCORING.bands.veryActive} and above`, BAND_LABELS.veryActive, SELF_BAND_LABELS.oftenAvailable],
]);
h(3, "5.2 Group lead scores");
p("Groups have different numbers of scales (9, 4, 5), so a plain mean would dilute managers. Each lead score is the mean of the two highest scales in the group: managerLead, firefighterLead, exileLead. REBL is excluded from lead scores (its role is mixed) but included in the protector ranking. protectionLoad = mean of all 14 protector scales, shown to facilitators only.");
h(3, "5.3 Who is leading: the system pattern");
p("Evaluated in this order; the first match wins.");
table(["#", "Pattern", "Rule"], [
  [1, "SELF_LED", `SELF ≥ ${SCORING.pattern.selfLedSelfMin} and all three lead scores < ${SCORING.pattern.selfLedLeadsMax}`],
  [2, "FLOODED (exiles leading)", `exileLead ≥ ${SCORING.pattern.floodedExileMin} and exileLead ≥ each protector lead − ${SCORING.pattern.floodedMargin}`],
  [3, "REACTIVE (firefighters leading)", `firefighterLead ≥ ${SCORING.pattern.groupLeadMin} and ≥ managerLead + ${SCORING.pattern.groupLeadGap}`],
  [4, "MANAGED (managers leading)", `managerLead ≥ ${SCORING.pattern.groupLeadMin} and ≥ firefighterLead + ${SCORING.pattern.groupLeadGap}`],
  [5, "POLARISED", `both ≥ ${SCORING.pattern.groupLeadMin} and within ${SCORING.pattern.groupLeadGap} of each other`],
  [6, "QUIET_OR_GUARDED", `none of the above (SELF < ${SCORING.pattern.quietSelfMax})`],
]);
p(`Modifiers: HIDDEN_EXILES is attached when the pattern is MANAGED, REACTIVE or POLARISED and exileLead < ${SCORING.pattern.hiddenExilesMax}. SELF_PRESENT is attached when the pattern is not SELF_LED and SELF ≥ ${SCORING.pattern.selfPresentMin}. A gap of exactly ${SCORING.pattern.groupLeadGap} between managers and firefighters resolves to MANAGED or REACTIVE, not POLARISED, because of the evaluation order.`);
h(3, "5.4 Leading parts");
p(`Protectors (14 scales) and exiles (5 scales) are ranked separately and never against each other. The top protector is called “leading” only if it is at least ${SCORING.leadingProtector.min} and at least ${SCORING.leadingProtector.gap} above the second; otherwise the top two are presented as “a team of protectors”, plus the third when it lies within ${SCORING.leadingProtector.teamThirdGap} of the second. Ties break by the count of items answered 4 or 5, then alphabetically by key.`);
h(3, "5.5 Protector and exile pairings (Triangle of Awareness, Wound corner)");
p(`A static map of theoretically expected links from the school's handout. A pairing is shown only when the protector is in the person's top ${SCORING.pairings.protectorTopN} and the linked exile scale is at least ${SCORING.pairings.exileMin}. The results then add: “In your answers, this protector appears alongside feelings of [exile theme]. It may be standing guard over them.”`);
table(["Protector", "Linked exile themes"], PROTECTOR_KEYS.map((k) => [`${k} ${TYPOLOGIES[k].name}`, PAIRINGS[k].map((e) => `${e} ${EXILES[e].name}`).join("; ")]));
h(3, "5.6 Response-quality flags and care flag");
p(`Stored and shown to facilitators only. STRAIGHT_LINING: the same answer on ${SCORING.quality.straightLiningShare * 100}% or more of items. TOO_FAST: completion under ${SCORING.quality.minSecondsFull / 60} minutes on the full form or ${SCORING.quality.minSecondsShort / 60} on the short form. ACQUIESCENCE: SELF ≥ ${SCORING.quality.acquiescenceSelfMin} and protectionLoad ≥ ${SCORING.quality.acquiescenceLoadMin}, which is theoretically unlikely.`);
p(`Care flag (cohort mode, facilitators only): pattern FLOODED, or exileLead ≥ ${SCORING.care.exileLeadMin}. Labelled “may benefit from extra support”, never as risk or pathology. It is information for pacing the retreat work, not a screening result.`);

h(2, "6. The results experience");
p("Order of the results page, fixed by design and enforced by a test: framing paragraph; “Who is leading?” with a diagram (Self at the centre, exile feelings around it, firefighters, then managers as the outer ring) and the pattern text; Self panel; protector profile (14 bars grouped Managers, Firefighters, Mixed); detail cards for the top three protectors; “What is being protected” (exiles, always after protectors); the “Meet this part” reflection for the leading protector only; care note; actions (PDF, email, retake); Level II panel in cohort mode; program invitation in public mode. When the pattern is FLOODED the care note moves to the top, support resources are shown, and the invitation is hidden.");
p("Fixed copy: " + [FRAMING, SELF_NOTE, CARE_NOTE, DISCLAIMER].map((t) => `“${t}”`).join(" · "));
p(`Colours carry no good/bad meaning and red is never used. Score colours: Self gold, Managers navy, Firefighters copper, Exiles slate. Wound language is always tentative (“Parts like this often protect…”, “You may recognise…”); the app never asserts a biographical fact about the person. The micro-question printed on every protector card: “${MICRO_QUESTION}”.`);
h(3, "6.1 Pattern texts");
(Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]).forEach((k) => p(`**${k}: ${PATTERNS[k].title}.** ${PATTERNS[k].body}`));
p(`**HIDDEN_EXILES note.** ${MODIFIERS.HIDDEN_EXILES}`);
p(`**SELF_PRESENT note.** ${MODIFIERS.SELF_PRESENT}`);

h(2, "7. The fourteen protectors");
p("Each card on the results page draws from the fields below. Role is the IFS role the school assigns; DISS and IMPL are proposed scales.");
for (const k of PROTECTOR_KEYS) {
  const t = TYPOLOGIES[k];
  h(3, `${k}. ${t.name} (${t.role})${t.proposed ? " — proposed" : ""}`);
  table(["Field", "Content"], [
    ["Triggers", t.triggers], ["Visible behaviour", t.visibleBehaviour], ["Strategy", t.strategy],
    ["Wound (tentative voice)", t.wound], ["Wound (handout source)", t.sourceWound], ["Cost", t.cost], ["Protective need", t.protectiveNeed],
    ["Linked exile themes", PAIRINGS[k].map((e) => EXILES[e].name).join("; ")],
  ]);
}

h(2, "8. The five exile themes");
p(EXILE_SECTION_COPY.intro);
p(`When protectors are strong and exile scores low, the page shows instead: “${EXILE_SECTION_COPY.hidden}”`);
table(["Key", "Name", "How it can feel when it breaks through", "Burden it may carry", "What it longs for"], EXILE_KEYS.map((k: ExileKey) => [k, EXILES[k].name, EXILES[k].howItFeels, EXILES[k].burdenBelief, EXILES[k].whatItNeeds]));

h(2, "9. Cohort mode and the facilitator dashboard");
p("Participants join with a cohort access code and sign in by an emailed six-digit code. They consent explicitly, with the date and policy version recorded, to storage under their account and to visibility by the named facilitators of their cohort; a separate, unticked box covers the newsletter. They can retake (each attempt kept with its timestamp), view any earlier map, keep a private note on the leading protector that they may share with the facilitator, export everything as JSON and delete their account, which is a real deletion with cascade.");
p(`Facilitators see only cohorts they are assigned to, enforced in the database. The cohort page lists participants with completion status, pattern, Self score, top three protectors, top exile theme, quality flags and the care flag; a cohort picture (pattern distribution, leading protectors, mean profile) appears once at least ${MIN_COMPLETED_FOR_AGGREGATES} participants have completed; item-level data can be downloaded as a pseudonymised CSV for psychometric analysis. Admins create cohorts (the access code is shown once and stored only as a hash), assign facilitators by email, download an identified CSV and read the audit log, which records every profile view and export.`);

h(2, "10. Data protection");
p(`All response data is treated as special category data. Public results are stored only with explicit consent, kept ${PUBLIC_RESULTS_RETENTION_MONTHS} months, and deletable at any time through a one-click link in the results email. Cohort data is kept ${COHORT_RETENTION_MONTHS} months after the cohort end date unless set otherwise, then deleted by a nightly job. No date of birth, no IP addresses in the database, no analytics cookies. Logs record job outcomes, never answers or email addresses. Everything is stored and processed in the European Union: Vercel (hosting, Frankfurt), Neon (database and sign-in, Frankfurt), Resend (email, EU), Upstash (rate limiting, EU). Minimum age: 18, self-declared. The privacy notice in the app is a placeholder pending legal review.`);

h(2, "11. Languages");
p("English is the master. Spanish (neutral, “tú”), Romanian and Turkish (“sen”) are drafts pending native-speaker review; the Turkish item bank received one review round. Specialised terms stay untranslated in every language: Yesod, Tiferet, Kay Pacha, Self (capitalised, the IFS Self). IFS role names appear with the English in parentheses on first use, for example “Bombero (Firefighter)”. Words never used in user-facing copy, in any language: diagnosis, disorder, clinical, scientifically validated, and their equivalents.");

h(2, "12. Glossary");
table(["Term", "Meaning in this test"], [
  ["Self", "The undamaged core of the person and the natural leader of the system. Measured by the SELF scale from the eight C's (calm, curiosity, compassion, clarity, confidence, courage, creativity, connectedness)."],
  ["Part", "A subpersonality with its own feelings, beliefs and role. Never the whole person."],
  ["Manager", "A proactive protector that organises life so tender places are never touched."],
  ["Firefighter", "A reactive protector that acts fast to put out pain once it breaks through."],
  ["Exile", "A young part carrying a burden, kept out of awareness by protectors."],
  ["Burden", "An extreme belief or feeling a part took on from experience; not the part's nature."],
  ["Blending", "When a part takes over and speaks or acts as if it were the whole person."],
  ["Self-leadership", "The Self leading the system with parts trusting it enough to step back."],
  ["Triangle of Awareness", "The school's frame for a protector: Strategy, Wound, Cost, plus Triggers and Protective Need."],
  ["System pattern", "The test's summary of who is leading: SELF_LED, FLOODED, REACTIVE, MANAGED, POLARISED or QUIET_OR_GUARDED."],
  ["Care flag", "A facilitator-only marker meaning “may benefit from extra support”; pacing information, not a risk score."],
  ["Short form / full form", "63 items (public default) or 84 items (cohort default) from the same bank."],
]);

h(2, "13. Guidance for people writing about the test");
[
  "Use part language throughout. Say “a part of you that plans and controls”, never “you are a controller”.",
  "Present every part, including firefighters, as having formed for a reason and as protecting something. Never rank parts as better or worse.",
  "Explain the exile limit honestly: low exile scores with strong protectors usually mean the protection is working.",
  "Keep the order: protectors first, exiles after, and any exercise addressed to a protector only.",
  "Call the thresholds heuristics. Do not call the test validated, clinical or diagnostic, and do not compare a person to a population.",
  "Do not promise transformation. The school's voice hedges the promise: “a framework for…”, “the conditions for…”.",
  "In cohort contexts, remember the care flag is for pacing, and facilitators only see participants who have consented.",
  "When the S.W.C.I.R. exercise text is finalised, it belongs in the content files, not in slides alone, so the app and the training stay aligned.",
].forEach((g) => lines.push(`- ${g}`));
lines.push("");

writeFileSync("docs/KNOWLEDGE-BASE.md", lines.join("\n"));
console.log("wrote docs/KNOWLEDGE-BASE.md", lines.length, "lines");
