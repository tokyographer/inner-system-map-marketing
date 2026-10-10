/**
 * The "book a reading session" link printed in the public PDF. It opens a WhatsApp chat with the
 * institute's number and a prefilled, generic message in the person's language. The message never
 * carries a name, a score or a pattern: the person sends it themselves from their own WhatsApp.
 */
import { INSTITUTE_WHATSAPP } from "@/config/app";

export function bookingLink(prefill: string, number: string = INSTITUTE_WHATSAPP): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(prefill)}`;
}
