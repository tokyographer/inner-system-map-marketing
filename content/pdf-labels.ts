/**
 * Labels used only inside the results PDF (the web page uses messages/*.json).
 * ES and RO are DRAFT, pending human review.
 */
import type { Locale } from "@/config/app";

export interface PdfLabels {
  generated: string; form: { full: string; short: string }; itemBank: string; mode: { public: string; cohort: string };
  whoIsLeading: string; exileFeelings: string; lead: string; self: string; selfLeadership: string; protectorProfile: string;
  leadingProtector: string; team: string; howItShows: string; triggers: string; strategy: string; wound: string; cost: string;
  protectiveNeed: string; microQuestion: string; proposed: string; howItFeels: string; burden: string; longsFor: string; invite: string;
}

export const PDF_LABELS: Record<Locale, PdfLabels> = {
  en: {
    generated: "Generated", form: { full: "full form", short: "short form" }, itemBank: "item bank", mode: { public: "public mode", cohort: "cohort mode" },
    whoIsLeading: "Who is leading?", exileFeelings: "Exile feelings", lead: "lead", self: "Self", selfLeadership: "Self-leadership", protectorProfile: "Protector profile",
    leadingProtector: "Your leading protector, and the parts beside it", team: "A team of protectors", howItShows: "How it tends to show up", triggers: "What tends to trigger it",
    strategy: "Strategy", wound: "Wound", cost: "Cost", protectiveNeed: "Protective need", microQuestion: "A question to bring to this part", proposed: "proposed scale",
    howItFeels: "How it can feel when it breaks through", burden: "The burden it may carry", longsFor: "What it longs for",
    invite: "If you would like to get to know these parts in a held space, the Self Leadership Program at Transcendent Institute works with exactly this map. transcendentinstitute.com",
  },
  es: {
    generated: "Generado", form: { full: "forma completa", short: "forma corta" }, itemBank: "banco de ítems", mode: { public: "modo público", cohort: "modo cohorte" },
    whoIsLeading: "¿Quién está liderando?", exileFeelings: "Sentimientos exiliados", lead: "líder", self: "Self", selfLeadership: "Autoliderazgo", protectorProfile: "Perfil de protectores",
    leadingProtector: "Tu protector principal, y las partes a su lado", team: "Un equipo de protectores", howItShows: "Cómo suele mostrarse", triggers: "Qué suele activarla",
    strategy: "Estrategia", wound: "Herida", cost: "Coste", protectiveNeed: "Necesidad protectora", microQuestion: "Una pregunta para llevar a esta parte", proposed: "escala propuesta",
    howItFeels: "Cómo puede sentirse cuando aflora", burden: "El peso que puede cargar", longsFor: "Lo que anhela",
    invite: "Si quieres conocer estas partes en un espacio sostenido, el Programa de Autoliderazgo de Transcendent Institute trabaja exactamente con este mapa. transcendentinstitute.com",
  },
  ro: {
    generated: "Generat", form: { full: "forma completă", short: "forma scurtă" }, itemBank: "banca de itemi", mode: { public: "mod public", cohort: "mod cohortă" },
    whoIsLeading: "Cine conduce?", exileFeelings: "Sentimente exilate", lead: "conducere", self: "Self", selfLeadership: "Self-leadership", protectorProfile: "Profilul protectorilor",
    leadingProtector: "Protectorul tău principal și părțile de lângă el", team: "O echipă de protectori", howItShows: "Cum tinde să se arate", triggers: "Ce tinde să o declanșeze",
    strategy: "Strategie", wound: "Rană", cost: "Cost", protectiveNeed: "Nevoie protectoare", microQuestion: "O întrebare de adus acestei părți", proposed: "scală propusă",
    howItFeels: "Cum se poate simți când iese la suprafață", burden: "Povara pe care o poate purta", longsFor: "Ce își dorește",
    invite: "Dacă vrei să cunoști aceste părți într-un spațiu ținut cu grijă, Programul de Self-Leadership de la Transcendent Institute lucrează exact cu această hartă. transcendentinstitute.com",
  },
  tr: {
    generated: "Oluşturulma", form: { full: "tam form", short: "kısa form" }, itemBank: "madde bankası", mode: { public: "açık mod", cohort: "grup modu" },
    whoIsLeading: "Kim yönetiyor?", exileFeelings: "Sürgün duyguları", lead: "öncü", self: "Self", selfLeadership: "Öz liderlik", protectorProfile: "Koruyucu profili",
    leadingProtector: "Önde gelen koruyucun ve yanındaki parçalar", team: "Bir koruyucu ekibi", howItShows: "Nasıl ortaya çıkma eğiliminde", triggers: "Onu ne tetikleme eğiliminde",
    strategy: "Strateji", wound: "Yara", cost: "Bedel", protectiveNeed: "Koruyucu ihtiyaç", microQuestion: "Bu parçaya götürülecek bir soru", proposed: "önerilen ölçek",
    howItFeels: "Yüzeye çıktığında nasıl hissettirebilir", burden: "Taşıyor olabileceği yük", longsFor: "Neye özlem duyuyor",
    invite: "Bu parçaları tutulan bir alanda tanımak istersen, Transcendent Institute'ün Öz Liderlik Programı tam olarak bu haritayla çalışır. transcendentinstitute.com",
  },
};
