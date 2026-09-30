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
  exercise: string; exerciseWhy: string; exerciseSteps: string; beliefNote: string;
}

export const PDF_LABELS: Record<Locale, PdfLabels> = {
  en: {
    generated: "Generated", form: { full: "full form", short: "short form" }, itemBank: "item bank", mode: { public: "public mode", cohort: "cohort mode" },
    whoIsLeading: "Who is leading?", exileFeelings: "Exile feelings", lead: "lead", self: "Self", selfLeadership: "Self-leadership", protectorProfile: "Protector profile",
    leadingProtector: "Your leading protector, and the parts beside it", team: "A team of protectors", howItShows: "How it tends to show up", triggers: "What tends to trigger it",
    strategy: "Strategy", wound: "Wound", cost: "Cost", protectiveNeed: "Protective need", microQuestion: "A question to bring to this part", proposed: "proposed scale",
    howItFeels: "How it can feel when it breaks through", burden: "The burden it may carry", longsFor: "What it longs for",
    invite: "If you would like to get to know these parts in a held space, the Self Leadership Program at Transcendent Institute works with exactly this map. transcendentinstitute.com",
    exercise: "Meet this part", exerciseWhy: "This short reflection is for the protector named above, the part that most often takes the lead in your answers. In IFS we begin with protectors, never with the young parts they guard: a protector that feels understood can relax, and only then does the system open. Nothing you write here leaves your device unless you choose to share it.", exerciseSteps: "The five guided steps of this reflection are being prepared by Transcendent Institute and will appear here. For now, you can start with the sentence below.", beliefNote: "Write your answer here or on paper. The PDF does not store what you write in the app.",
  },
  es: {
    generated: "Generado", form: { full: "forma completa", short: "forma corta" }, itemBank: "banco de ítems", mode: { public: "modo público", cohort: "modo cohorte" },
    whoIsLeading: "¿Quién está liderando?", exileFeelings: "Sentimientos exiliados", lead: "líder", self: "Self", selfLeadership: "Autoliderazgo", protectorProfile: "Perfil de protectores",
    leadingProtector: "Tu protector principal, y las partes a su lado", team: "Un equipo de protectores", howItShows: "Cómo suele mostrarse", triggers: "Qué suele activarla",
    strategy: "Estrategia", wound: "Herida", cost: "Coste", protectiveNeed: "Necesidad protectora", microQuestion: "Una pregunta para llevar a esta parte", proposed: "escala propuesta",
    howItFeels: "Cómo puede sentirse cuando aflora", burden: "El peso que puede cargar", longsFor: "Lo que anhela",
    invite: "Si quieres conocer estas partes en un espacio sostenido, el Programa de Autoliderazgo de Transcendent Institute trabaja exactamente con este mapa. transcendentinstitute.com",
    exercise: "Conoce a esta parte", exerciseWhy: "Esta breve reflexión es para el protector nombrado arriba, la parte que más a menudo toma la delantera en tus respuestas. En IFS empezamos por los protectores, nunca por las partes jóvenes que custodian: un protector que se siente comprendido puede relajarse, y solo entonces el sistema se abre. Nada de lo que escribas aquí sale de tu dispositivo a menos que decidas compartirlo.", exerciseSteps: "Transcendent Institute está preparando los cinco pasos guiados de esta reflexión y aparecerán aquí. Por ahora, puedes empezar con la frase de abajo.", beliefNote: "Escribe tu respuesta aquí o en papel. El PDF no guarda lo que escribes en la app.",
  },
  ro: {
    generated: "Generat", form: { full: "forma completă", short: "forma scurtă" }, itemBank: "banca de itemi", mode: { public: "mod public", cohort: "mod cohortă" },
    whoIsLeading: "Cine conduce?", exileFeelings: "Sentimente exilate", lead: "conducere", self: "Self", selfLeadership: "Self-leadership", protectorProfile: "Profilul protectorilor",
    leadingProtector: "Protectorul tău principal și părțile de lângă el", team: "O echipă de protectori", howItShows: "Cum tinde să se arate", triggers: "Ce tinde să o declanșeze",
    strategy: "Strategie", wound: "Rană", cost: "Cost", protectiveNeed: "Nevoie protectoare", microQuestion: "O întrebare de adus acestei părți", proposed: "scală propusă",
    howItFeels: "Cum se poate simți când iese la suprafață", burden: "Povara pe care o poate purta", longsFor: "Ce își dorește",
    invite: "Dacă vrei să cunoști aceste părți într-un spațiu ținut cu grijă, Programul de Self-Leadership de la Transcendent Institute lucrează exact cu această hartă. transcendentinstitute.com",
    exercise: "Cunoaște această parte", exerciseWhy: "Această scurtă reflecție este pentru protectorul numit mai sus, partea care preia cel mai des conducerea în răspunsurile tale. În IFS începem cu protectorii, niciodată cu părțile tinere pe care le păzesc: un protector care se simte înțeles se poate relaxa, și abia atunci sistemul se deschide. Nimic din ce scrii aici nu părăsește dispozitivul tău decât dacă alegi să împărtășești.", exerciseSteps: "Cei cinci pași ghidați ai acestei reflecții sunt pregătiți de Transcendent Institute și vor apărea aici. Deocamdată, poți începe cu propoziția de mai jos.", beliefNote: "Scrie răspunsul aici sau pe hârtie. PDF-ul nu stochează ce scrii în aplicație.",
  },
  tr: {
    generated: "Oluşturulma", form: { full: "tam form", short: "kısa form" }, itemBank: "madde bankası", mode: { public: "açık mod", cohort: "grup modu" },
    whoIsLeading: "Kim yönetiyor?", exileFeelings: "Sürgün duyguları", lead: "öncü", self: "Self", selfLeadership: "Öz liderlik", protectorProfile: "Koruyucu profili",
    leadingProtector: "Önde gelen koruyucun ve yanındaki parçalar", team: "Bir koruyucu ekibi", howItShows: "Nasıl ortaya çıkma eğiliminde", triggers: "Onu ne tetikleme eğiliminde",
    strategy: "Strateji", wound: "Yara", cost: "Bedel", protectiveNeed: "Koruyucu ihtiyaç", microQuestion: "Bu parçaya götürülecek bir soru", proposed: "önerilen ölçek",
    howItFeels: "Yüzeye çıktığında nasıl hissettirebilir", burden: "Taşıyor olabileceği yük", longsFor: "Neye özlem duyuyor",
    invite: "Bu parçaları tutulan bir alanda tanımak istersen, Transcendent Institute'ün Öz Liderlik Programı tam olarak bu haritayla çalışır. transcendentinstitute.com",
    exercise: "Bu parçayla tanış", exerciseWhy: "Bu kısa yansıtma, yukarıda adı geçen koruyucu içindir; yanıtlarında en sık öne çıkan parça. IFS'te koruyuculardan başlarız, onların koruduğu genç parçalardan asla: anlaşıldığını hisseden bir koruyucu gevşeyebilir ve sistem ancak o zaman açılır. Burada yazdıkların, paylaşmayı seçmedikçe cihazından çıkmaz.", exerciseSteps: "Bu yansıtmanın beş rehberli adımı Transcendent Institute tarafından hazırlanıyor ve burada görünecek. Şimdilik aşağıdaki cümleyle başlayabilirsin.", beliefNote: "Yanıtını buraya ya da kâğıda yaz. PDF, uygulamada yazdıklarını saklamaz.",
  },
};
