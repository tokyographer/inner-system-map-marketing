/**
 * DRAFT, pending human review.
 * Pattern, modifier, framing and care copy, Romanian. Part language only.
 */
import type { Band, ModifierKey, PatternKey, SelfBand } from "@/lib/scoring/types";

export const FRAMING_RO = "Aceasta este o hartă a felului în care este organizat sistemul tău interior chiar acum, nu o etichetă. Părțile nu sunt tu. Adevărata cunoaștere vine din a le cunoaște.";
export const SELF_NOTE_RO = "În IFS, Self-ul nu este niciodată deteriorat sau absent. Este doar mai mult sau mai puțin înghesuit de părți care au trebuit să muncească din greu.";
export const CARE_NOTE_RO = "Dacă asta a stârnit emoții puternice, încetinește și caută pe cineva în care ai încredere sau un profesionist în sănătate mintală. Acest instrument nu înlocuiește sprijinul profesionist.";
export const DISCLAIMER_RO = "Acesta este un instrument de reflecție bazat pe autoevaluare. Nu este un instrument psihometric validat și nu evaluează sau identifică nicio afecțiune. Benzile și pragurile sunt criterii euristice ale școlii, nu norme.";

export const PATTERNS_RO: Record<PatternKey, { title: string; body: string }> = {
  SELF_LED: { title: "Self-ul conduce", body: "Chiar acum răspunsurile tale sugerează că energia Self-ului este disponibilă în cea mai mare parte a timpului și că niciun grup de părți nu conduce sistemul. Părțile sunt tot acolo, și unele sunt active, dar par să aibă destulă încredere în tine ca să facă un pas înapoi. E un moment bun să le cunoști cât lucrurile sunt liniștite." },
  FLOODED: { title: "Emoțiile exilate ies la suprafață", body: "Răspunsurile tale sugerează că sentimente vechi și fragile apar des în acest moment, mai mult decât pot ține protectorii în frâu. Nu este eșecul niciunei părți. De obicei înseamnă că ceva cere să fie auzit. Te rugăm să mergi încet și să lași asta să fie întâmpinat într-un spațiu ținut cu grijă, nu singur." },
  REACTIVE: { title: "Pompierii (Firefighters) conduc", body: "Răspunsurile tale sugerează că protectorii cu acțiune rapidă preiau conducerea: părți care acționează repede ca să stingă durerea odată ce iese la suprafață. Muncesc din greu și metodele lor pot costa. Nu sunt problema; sunt răspunsul la ceva de dedesubt." },
  MANAGED: { title: "Managerii conduc", body: "Răspunsurile tale sugerează că protectorii proactivi organizează viața de zi cu zi: părți care planifică, verifică, mulțumesc pe alții, controlează sau păstrează distanța, astfel încât locurile fragile să nu fie atinse niciodată. Probabil au fost foarte eficiente. Costul tinde să fie efort, rigiditate și senzația că nu trăiești pe deplin." },
  POLARISED: { title: "Managerii și Pompierii, ambii puternici", body: "Răspunsurile tale sugerează două grupuri de protectori care muncesc din greu în același timp: unii țin lucrurile laolaltă, alții se eliberează când presiunea devine prea mare. Sistemele de acest fel se simt adesea ca o tragere de frânghie. Ambele părți încearcă să ajute, și ambele merită curiozitate." },
  QUIET_OR_GUARDED: { title: "Liniște, sau gardă", body: "Răspunsurile tale arată activitate scăzută în tot sistemul, fără ca energia Self-ului să fie clar disponibilă. Poate însemna o perioadă de calm. Poate însemna și că o parte a răspuns în locul tău, ținând lucrurile la distanță. Oricare e în regulă. Poate vrei să fii curios care dintre ele este." },
};

export const MODIFIERS_RO: Record<ModifierKey, string> = {
  HIDDEN_EXILES: "Scoruri mici ale exilaților alături de protectori puternici înseamnă de obicei că protecția funcționează, nu că nu ar fi nimic de protejat.",
  SELF_PRESENT: "Energia Self-ului este disponibilă alături de părțile active. Aceasta este cea mai bună condiție pentru a le cunoaște.",
};

export const BAND_LABELS_RO: Record<Band, string> = { quiet: "liniștită", present: "prezentă", veryActive: "foarte activă" };
export const SELF_BAND_LABELS_RO: Record<SelfBand, string> = { hardToReach: "greu de atins chiar acum", availableAtTimes: "disponibil uneori", oftenAvailable: "disponibil adesea" };
export const GROUP_LABELS_RO = { managers: "Manageri (Managers)", firefighters: "Pompieri (Firefighters)", mixed: "Rol mixt", exiles: "Ce este protejat", self: "Self" } as const;
export const PAIRING_SENTENCE_RO = (exileName: string) => `În răspunsurile tale, acest protector apare alături de sentimente de ${exileName}. S-ar putea să stea de pază peste ele.`;
