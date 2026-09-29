/**
 * DRAFT, pending human review.
 * Exile theme content, Spanish. Warm, brief, no biography, no instruction
 * to go and meet the exile. "Exiliado (Exile)" on first use.
 */
import type { ExileKey } from "@/lib/scoring/types";
import type { ExileTheme } from "./exiles.en";

export const EXILE_SECTION_COPY_ES = {
  intro:
    "Estas son partes jóvenes que cargan pesos antiguos: en IFS se las llama Exiliados (Exiles). El peso no es lo que son. En IFS no vamos a ellas directamente: primero nos ganamos la confianza de los protectores que las custodian. Este es un trabajo para un espacio sostenido, con un facilitador o terapeuta, no algo en lo que entrar a solas.",
  hidden:
    "Tus respuestas muestran protectores fuertes y poca emoción exiliada saliendo a la superficie. En IFS esto suele significar que la protección está funcionando, no que no haya nada que proteger. No hay nada que perseguir aquí. Conocer a los protectores es el camino de entrada, cuando y si tú lo eliges.",
};

export const EXILES_ES: Record<ExileKey, ExileTheme> = {
  SHAM: { key: "SHAM", name: "No ser suficiente / Vergüenza", howItFeels: "Derrumbe tras fallos pequeños, ganas de esconderse, sensación de ser defectuoso o defectuosa.", burdenBelief: "\"Algo está mal en mí\".", whatItNeeds: "Ser vista y aceptada tal como es." },
  ABAN: { key: "ABAN", name: "Abandono / No ser digno de amor", howItFeels: "Dolor o pánico cuando alguien que te importa se aleja, sensación de no ser elegido o elegida.", burdenBelief: "\"Me van a dejar. No pueden quererme como soy\".", whatItNeeds: "Que se queden a su lado." },
  FEAR: { key: "FEAR", name: "Inseguridad / Miedo", howItFeels: "Oleadas de miedo, una sensación de ser pequeño y estar asustado, un cuerpo en alerta.", burdenBelief: "\"No estoy a salvo\".", whatItNeeds: "Protección y una presencia calmada cerca." },
  POWL: { key: "POWL", name: "Impotencia / Invisibilidad", howItFeels: "Congelarse, sentirse invisible o atrapado, sin voz.", burdenBelief: "\"Lo que quiero no importa\".", whatItNeeds: "Tener voz y que alguien la defienda." },
  LONE: { key: "LONE", name: "Soledad / Duelo", howItFeels: "Una tristeza antigua, vacío, anhelo de algo que nunca se recibió.", burdenBelief: "\"Estoy sola con esto\".", whatItNeeds: "Compañía, y espacio para el duelo." },
};
