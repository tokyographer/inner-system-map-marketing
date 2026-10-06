/**
 * Stores source attribution on an opt-in public result (columns from
 * m0001_attribution.sql). Runs on the service connection, like the public
 * result insert itself. Attribution is optional: a failure is logged by reason
 * only and never fails the results email.
 */
import { asService } from "@/lib/db";
import type { Attribution } from "../validation";

export async function saveResultAttribution(publicResultId: string, a: Attribution): Promise<boolean> {
  try {
    const { rowCount } = await asService((db) => db.query(
      "update public.public_results set utm_source = $2, utm_medium = $3, utm_campaign = $4, ref_code = $5 where id = $1",
      [publicResultId, a.utmSource ?? null, a.utmMedium ?? null, a.utmCampaign ?? null, a.ref ?? null]));
    return rowCount === 1;
  } catch (err) {
    console.error("attribution store failed", { reason: err instanceof Error ? err.message : "unknown" });
    return false;
  }
}
