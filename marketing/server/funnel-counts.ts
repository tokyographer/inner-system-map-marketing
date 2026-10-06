/**
 * Registered partner codes and start/completion counts per code (m0002).
 * The public endpoint increments on the service connection: the request is
 * anonymous and the row holds no personal data. Unregistered codes are counted
 * under '-', so visitors cannot add rows or store their own strings. Admin
 * reads and partner registration go through withUser so RLS applies.
 */
import { asService, withUser } from "@/lib/db";
import type { CountedEvent } from "../validation";

export const UNREGISTERED = "-";
export const COUNT_RETENTION_DAYS = 400;

export async function incrementFunnel(event: CountedEvent, ref: string | undefined): Promise<void> {
  await asService((db) => db.query(
    `insert into public.marketing_funnel_counts (ref_code, event, count)
     values (case when $1 = '' then '' when exists (select 1 from public.marketing_partners where code = $1) then $1 else '${UNREGISTERED}' end, $2, 1)
     on conflict (day, ref_code, event) do update set count = public.marketing_funnel_counts.count + 1`,
    [ref ?? "", event]));
}

/** Called by the retention cron. Returns the number of rows removed. */
export async function pruneFunnelCounts(): Promise<number> {
  const { rowCount } = await asService((db) => db.query(`delete from public.marketing_funnel_counts where day < current_date - ${COUNT_RETENTION_DAYS}`));
  return rowCount ?? 0;
}

export interface RefCounts { ref: string; label: string | null; starts: number; completions: number; starts30: number; completions30: number }

/** Every registered partner (even with no counts), then the no-code and unregistered rows. Empty for anyone but an admin (RLS). */
export async function listRefCounts(userId: string): Promise<RefCounts[]> {
  return withUser(userId, async (db) => {
    const { rows } = await db.query<{ ref_code: string; label: string | null; starts: string; completions: string; starts30: string; completions30: string }>(
      `with codes as (
         select code as ref_code, label, 0 as ord from public.marketing_partners
         union all select '', null, 1 union all select '${UNREGISTERED}', null, 2
       )
       select c.ref_code, c.label,
              coalesce(sum(f.count) filter (where f.event = 'start'), 0) as starts,
              coalesce(sum(f.count) filter (where f.event = 'complete'), 0) as completions,
              coalesce(sum(f.count) filter (where f.event = 'start' and f.day > current_date - 30), 0) as starts30,
              coalesce(sum(f.count) filter (where f.event = 'complete' and f.day > current_date - 30), 0) as completions30
         from codes c left join public.marketing_funnel_counts f on f.ref_code = c.ref_code
        where app.is_admin()
        group by c.ref_code, c.label, c.ord
        order by c.ord, starts desc, c.ref_code
        limit 500`);
    return rows.map((r) => ({ ref: r.ref_code, label: r.label, starts: Number(r.starts), completions: Number(r.completions), starts30: Number(r.starts30), completions30: Number(r.completions30) }));
  });
}
