/**
 * Stores source attribution on an opt-in public result (columns from
 * m0001_attribution.sql). Runs on the service connection, like the public
 * result insert itself. The partner code is kept only when it is registered
 * (m0002 `marketing_partners`), so a visitor-typed code is never stored.
 * Attribution is optional: a failure is logged by reason
 * only and never fails the results email.
 */
import { asService } from "@/lib/db";
import type { Attribution } from "../validation";

/** `registeredRef` is the partner code as stored: the code when it is registered, otherwise null. */
export async function saveResultAttribution(publicResultId: string, a: Attribution): Promise<{ saved: boolean; registeredRef: string | null }> {
  try {
    const { rows } = await asService((db) => db.query<{ ref_code: string | null }>(
      `update public.public_results set utm_source = $2, utm_medium = $3, utm_campaign = $4,
              ref_code = (select code from public.marketing_partners where code = $5) where id = $1 returning ref_code`,
      [publicResultId, a.utmSource ?? null, a.utmMedium ?? null, a.utmCampaign ?? null, a.ref ?? null]));
    return { saved: rows.length === 1, registeredRef: rows[0]?.ref_code ?? null };
  } catch (err) {
    console.error("attribution store failed", { reason: err instanceof Error ? err.message : "unknown" });
    return { saved: false, registeredRef: null };
  }
}
