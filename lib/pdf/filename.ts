/**
 * Results PDF filename: app name in the given locale, then the person's name,
 * as an ASCII slug (safe in Content-Disposition and mail attachments).
 * "Ana García", es → "mapa-del-sistema-interno-results-ana-garcia.pdf".
 * Client-safe: no PDF renderer imports.
 */
import { APP_NAME, type Locale } from "@/config/app";

const LETTERS: Record<string, string> = { ı: "i", ß: "ss", æ: "ae", ø: "o", œ: "oe", ł: "l", đ: "d", ð: "d", þ: "th" };

export function slugify(text: string, maxLength = 40): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[ıßæøœłđðþ]/g, (ch) => LETTERS[ch])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

export function resultsPdfFilename(locale: Locale, name?: string | null): string {
  const person = name ? slugify(name) : "";
  return `${slugify(APP_NAME[locale], 60)}-results${person ? `-${person}` : ""}.pdf`;
}
