/**
 * Copy for the results email sent to the person (the institute copy stays in English).
 * Placeholders: {app}, {name}, {months}, {url}. ES, RO and TR are DRAFT, pending human review.
 */
import type { Locale } from "@/config/app";

export interface EmailLabels {
  subject: string; greetingNamed: string; greeting: string; thanks: string; attached: string;
  keptWithLink: string; keptReplyToDelete: string;
}

export const EMAIL_LABELS: Record<Locale, EmailLabels> = {
  en: {
    subject: "Your {app} results", greetingNamed: "Hello {name},", greeting: "Hello,", thanks: "Thank you for taking the {app}.",
    attached: "Your results are attached as a PDF. This is a map of how your inner system is organised right now, not a label.",
    keptWithLink: "You asked us to keep a copy of these results for {months} months. To delete it now, open this link: {url}",
    keptReplyToDelete: "You asked us to keep a copy of these results. You can ask for it to be deleted at any time by replying to this email.",
  },
  es: {
    subject: "Tus resultados del {app}", greetingNamed: "Hola, {name}:", greeting: "Hola:", thanks: "Gracias por responder el {app}.",
    attached: "Tus resultados van adjuntos en PDF. Es un mapa de cómo está organizado tu sistema interno ahora mismo, no una etiqueta.",
    keptWithLink: "Nos pediste que guardáramos una copia de estos resultados durante {months} meses. Para borrarla ahora, abre este enlace: {url}",
    keptReplyToDelete: "Nos pediste que guardáramos una copia de estos resultados. Puedes pedir que se borre en cualquier momento respondiendo a este correo.",
  },
  ro: {
    subject: "Rezultatele tale: {app}", greetingNamed: "Bună, {name},", greeting: "Bună,", thanks: "Îți mulțumim că ai completat {app}.",
    attached: "Rezultatele tale sunt atașate ca PDF. Este o hartă a felului în care este organizat sistemul tău interior acum, nu o etichetă.",
    keptWithLink: "Ne-ai cerut să păstrăm o copie a acestor rezultate timp de {months} luni. Ca s-o ștergi acum, deschide acest link: {url}",
    keptReplyToDelete: "Ne-ai cerut să păstrăm o copie a acestor rezultate. Poți cere oricând ștergerea ei răspunzând la acest email.",
  },
  tr: {
    subject: "{app} sonuçların", greetingNamed: "Merhaba {name},", greeting: "Merhaba,", thanks: "{app} anketini doldurduğun için teşekkür ederiz.",
    attached: "Sonuçların PDF olarak ekte. Bu, iç sisteminin şu anda nasıl düzenlendiğinin bir haritasıdır, bir etiket değil.",
    keptWithLink: "Bu sonuçların bir kopyasını {months} ay saklamamızı istedin. Şimdi silmek için bu bağlantıyı aç: {url}",
    keptReplyToDelete: "Bu sonuçların bir kopyasını saklamamızı istedin. Bu e-postayı yanıtlayarak istediğin zaman silinmesini isteyebilirsin.",
  },
};

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
