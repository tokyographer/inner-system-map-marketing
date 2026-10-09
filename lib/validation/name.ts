/**
 * The name a person types is printed in the PDF header, the email greeting, the WhatsApp template
 * and the filename, all sent under the institute's name. Keep only letters, marks, spaces,
 * apostrophes and hyphens (at most 60 characters) so nobody can put a link, a phone number or a
 * message into something the institute sends.
 */
export const DISPLAY_NAME_MAX = 60;

/** Null when nothing usable is left. */
export function cleanDisplayName(input: string): string | null {
  const clean = input.replace(/[^\p{L}\p{M}\s'’-]/gu, "").replace(/\s+/g, " ").trim().slice(0, DISPLAY_NAME_MAX).trim();
  return /\p{L}/u.test(clean) ? clean : null;
}
