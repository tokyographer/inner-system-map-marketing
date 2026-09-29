/**
 * DRAFT, pending human review.
 * Exile theme content, Romanian. Warm, brief, no biography, no instruction
 * to go and meet the exile. "Exilat (Exile)" on first use.
 */
import type { ExileKey } from "@/lib/scoring/types";
import type { ExileTheme } from "./exiles.en";

export const EXILE_SECTION_COPY_RO = {
  intro:
    "Acestea sunt părți tinere care poartă poveri vechi: în IFS se numesc Exilați (Exiles). Povara nu este ceea ce sunt ele. În IFS nu mergem direct la ele: mai întâi câștigăm încrederea protectorilor care stau de pază. Aceasta este o muncă pentru un spațiu ținut cu grijă, cu un facilitator sau un terapeut, nu ceva în care să intri singur.",
  hidden:
    "Răspunsurile tale arată protectori puternici și puțină emoție exilată care iese la suprafață. În IFS asta înseamnă de obicei că protecția funcționează, nu că nu ar fi nimic de protejat. Nu e nimic de urmărit aici. Cunoașterea protectorilor este calea de intrare, când și dacă alegi.",
};

export const EXILES_RO: Record<ExileKey, ExileTheme> = {
  SHAM: { key: "SHAM", name: "Nu sunt de ajuns / Rușine", howItFeels: "Prăbușire după eșecuri mici, dorința de a te ascunde, senzația de a fi defect.", burdenBelief: "„Ceva e în neregulă cu mine.”", whatItNeeds: "Să fie văzută și acceptată așa cum e." },
  ABAN: { key: "ABAN", name: "Abandonat / Nedemn de iubire", howItFeels: "Durere sau panică atunci când cineva la care ții se retrage, senzația de a nu fi ales.", burdenBelief: "„Voi fi părăsit. Nu pot fi iubit așa cum sunt.”", whatItNeeds: "Ca cineva să rămână alături." },
  FEAR: { key: "FEAR", name: "Nesiguranță / Frică", howItFeels: "Valuri de frică, senzația de a fi mic și speriat, un corp în alertă.", burdenBelief: "„Nu sunt în siguranță.”", whatItNeeds: "Protecție și o prezență calmă în apropiere." },
  POWL: { key: "POWL", name: "Neputință / Nevăzut", howItFeels: "Înghețare, senzația de a fi invizibil sau prins în capcană, fără voce.", burdenBelief: "„Ce vreau eu nu contează.”", whatItNeeds: "Să aibă o voce și să fie apărată." },
  LONE: { key: "LONE", name: "Singurătate / Doliu", howItFeels: "O tristețe veche, gol, dor după ceva ce n-a primit niciodată.", burdenBelief: "„Sunt singur cu asta.”", whatItNeeds: "Companie și loc pentru a jeli." },
};
