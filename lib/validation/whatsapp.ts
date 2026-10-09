/**
 * WhatsApp numbers in international (E.164) form. Plain functions without zod so the start
 * screen can share them with the server schema.
 */
const E164 = /^\+[1-9]\d{7,14}$/;

/** Removes spaces, dashes, dots and brackets, and turns a leading 00 into +. */
export function normalizeWhatsApp(input: string): string {
  const compact = input.trim().replace(/[\s().-]/g, "");
  return compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
}

export function isWhatsAppNumber(input: string): boolean {
  return E164.test(normalizeWhatsApp(input));
}
