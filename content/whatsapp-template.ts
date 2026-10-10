/**
 * DRAFT, pending human review. Body of the WhatsApp Utility template `inner_system_map_results`,
 * one per locale, exactly as submitted to Meta (the approved copy lives in WhatsApp Manager; the
 * code only sends the template name, so this file is the reviewable record and is scanned by the
 * forbidden-word test). {{1}} is the person's cleaned name. Keep it purely transactional
 * (delivery of the results the person asked for): any invitation or promotion can make Meta reclassify it as
 * Marketing. The reading-session call to action lives only in the PDF.
 */
import type { Locale } from "@/config/app";

export const WHATSAPP_TEMPLATE_NAME = "inner_system_map_results";

export const WHATSAPP_TEMPLATE_BODY: Record<Locale, string> = {
  en: "Hello {{1}}, your Inner System Map results are attached as a PDF. Thank you for taking the time to reflect.",
  es: "Hola, {{1}}: adjuntamos en PDF tus resultados del Mapa del Sistema Interno. Gracias por tomarte el tiempo de reflexionar.",
  ro: "Bună, {{1}}! Rezultatele tale din Harta Sistemului Interior sunt atașate ca PDF. Îți mulțumim că ți-ai făcut timp pentru reflecție.",
  tr: "Merhaba {{1}}, İç Sistem Haritası sonuçların PDF olarak ekte. Düşünmeye zaman ayırdığın için teşekkür ederiz.",
};
