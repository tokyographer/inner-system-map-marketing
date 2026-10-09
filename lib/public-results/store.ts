/**
 * Public opt-in results: stored only after explicit consent, kept for
 * PUBLIC_RESULTS_RETENTION_MONTHS, deletable at any time through a signed
 * one-click link sent in the results email. The plain token is never stored.
 */
import { createHash, randomBytes } from "node:crypto";
import { ITEM_BANK_VERSION, PUBLIC_RESULTS_RETENTION_MONTHS } from "@/config/app";
import { SCORING_VERSION } from "@/config/scoring";
import { asService } from "@/lib/db";
import type { Responses, Result } from "@/lib/scoring/types";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface StoreArgs {
  email: string; locale: string; form: "full" | "short"; responses: Responses; result: Result; newsletter: boolean; policyVersion: string;
}

/** Inserts the record and returns the plain delete token (for the email link only). */
export async function storePublicResult(a: StoreArgs): Promise<{ id: string; deleteToken: string; expiresAt: Date }> {
  const deleteToken = randomBytes(24).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + PUBLIC_RESULTS_RETENTION_MONTHS);
  const id = await asService(async (db) => {
    const { rows } = await db.query<{ id: string }>(
      `insert into public.public_results (email, locale, item_bank_version, scoring_version, form, responses, scores, newsletter_opt_in, policy_version, delete_token_hash, expires_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`,
      [a.email, a.locale, ITEM_BANK_VERSION, SCORING_VERSION, a.form, JSON.stringify(a.responses), JSON.stringify(a.result), a.newsletter, a.policyVersion, hashToken(deleteToken), expiresAt.toISOString()]);
    return rows[0].id;
  });
  return { id, deleteToken, expiresAt };
}

/** Records the WhatsApp number after a successful send. Needs 0010; the caller treats a failure as "not recorded". */
export async function recordWhatsApp(id: string, whatsapp: string): Promise<void> {
  await asService((db) => db.query("update public.public_results set whatsapp = $1 where id = $2", [whatsapp, id]));
}

/** Deletes by plain token. Returns true when a row was removed. */
export async function deletePublicResult(token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return false;
  return asService(async (db) => (await db.query("delete from public.public_results where delete_token_hash = $1", [hashToken(token)])).rowCount === 1);
}
