import { createHash, randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-friendly code like TI-7KQ4-M2XP. Never stored in plain form. */
export function generateAccessCode(): string {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `TI-${part()}-${part()}`;
}

/** Same formula as app.hash_access_code in SQL: sha256(lower(trim(code))). */
export function hashAccessCode(code: string): string {
  return createHash("sha256").update(code.trim().toLowerCase()).digest("hex");
}
