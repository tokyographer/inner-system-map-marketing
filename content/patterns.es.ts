/**
 * DRAFT, pending human review.
 * Pattern, modifier, framing and care copy, Spanish. Part language only.
 */
import type { Band, ModifierKey, PatternKey, SelfBand } from "@/lib/scoring/types";

export const FRAMING_ES = "Esto es un mapa de cómo está organizado tu sistema interno ahora mismo, no una etiqueta. Las partes no son tú. El verdadero conocimiento llega al conocerlas.";
export const SELF_NOTE_ES = "En IFS, el Self nunca está dañado ni ausente. Solo está más o menos desplazado por partes que han tenido que trabajar mucho.";
export const CARE_NOTE_ES = "Si esto ha removido emociones fuertes, ve despacio y busca a alguien de confianza o a un profesional de la salud mental. Esta herramienta no sustituye el apoyo profesional.";
export const DISCLAIMER_ES = "Esta es una herramienta de reflexión basada en autoinforme. No es un instrumento psicométrico validado y no evalúa ni identifica ninguna condición. Las bandas y umbrales son criterios heurísticos de la escuela, no normas.";

export const PATTERNS_ES: Record<PatternKey, { title: string; body: string }> = {
  SELF_LED: { title: "El Self está liderando", body: "Ahora mismo tus respuestas sugieren que la energía del Self está disponible la mayor parte del tiempo y que ningún grupo de partes dirige el sistema. Las partes siguen ahí, y algunas están activas, pero parecen confiar en ti lo suficiente como para dar un paso atrás. Es un buen momento para conocerlas mientras las cosas están en calma." },
  FLOODED: { title: "Las emociones exiliadas están saliendo a la superficie", body: "Tus respuestas sugieren que sentimientos antiguos y tiernos están aflorando a menudo en este momento, más de lo que los protectores pueden contener. Esto no es un fallo de ninguna parte. Suele significar que algo pide ser escuchado. Ve despacio, por favor, y deja que esto se acompañe en un espacio sostenido y no a solas." },
  REACTIVE: { title: "Los Bomberos (Firefighters) están liderando", body: "Tus respuestas sugieren que los protectores de acción rápida están tomando la delantera: partes que actúan deprisa para apagar el dolor en cuanto aflora. Trabajan mucho y sus métodos pueden salir caros. No son el problema; son la respuesta a algo que hay debajo." },
  MANAGED: { title: "Los Gestores (Managers) están liderando", body: "Tus respuestas sugieren que los protectores proactivos organizan la vida diaria: partes que planifican, revisan, complacen, controlan o mantienen distancia para que los lugares tiernos no se toquen nunca. Probablemente han sido muy eficaces. El coste suele ser esfuerzo, rigidez y una sensación de no vivir del todo." },
  POLARISED: { title: "Gestores y Bomberos, ambos fuertes", body: "Tus respuestas sugieren dos grupos de protectores trabajando mucho a la vez: unos sosteniendo todo, otros liberándose cuando la presión es demasiada. Los sistemas así a menudo se sienten como un tira y afloja. Ambos lados intentan ayudar, y ambos merecen curiosidad." },
  QUIET_OR_GUARDED: { title: "En calma, o en guardia", body: "Tus respuestas muestran poca actividad en todo el sistema, sin que la energía del Self esté claramente disponible. Puede ser un periodo de calma. También puede ser que una parte haya respondido por ti, manteniendo las cosas a distancia. Cualquiera de las dos está bien. Quizá quieras sentir curiosidad por cuál de las dos es." },
};

export const MODIFIERS_ES: Record<ModifierKey, string> = {
  HIDDEN_EXILES: "Puntuaciones bajas de exiliados junto a protectores fuertes suelen significar que la protección está funcionando, no que no haya nada que proteger.",
  SELF_PRESENT: "Hay energía del Self disponible junto a las partes activas. Esa es la mejor condición para conocerlas.",
};

export const BAND_LABELS_ES: Record<Band, string> = { quiet: "tranquila", present: "presente", veryActive: "muy activa" };
export const SELF_BAND_LABELS_ES: Record<SelfBand, string> = { hardToReach: "difícil de alcanzar ahora mismo", availableAtTimes: "disponible a ratos", oftenAvailable: "disponible a menudo" };
export const GROUP_LABELS_ES = { managers: "Gestores (Managers)", firefighters: "Bomberos (Firefighters)", mixed: "Rol mixto", exiles: "Lo que está siendo protegido", self: "Self" } as const;
export const PAIRING_SENTENCE_ES = (exileName: string) => `En tus respuestas, este protector aparece junto a sentimientos de ${exileName}. Puede que esté montando guardia sobre ellos.`;
