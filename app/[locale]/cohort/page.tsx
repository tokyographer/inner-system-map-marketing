import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContent } from "@/content";
import type { Locale } from "@/config/app";
import { Link, redirect } from "@/i18n/navigation";
import { userWithProfile } from "@/lib/actions/session";
import { withUser } from "@/lib/db";
import type { PatternKey } from "@/lib/scoring/types";

export const dynamic = "force-dynamic";

export default async function CohortHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await userWithProfile(locale);
  if (!user) redirect({ href: "/cohort/join", locale });
  const t = await getTranslations("cohort");
  const content = getContent(locale as Locale);

  const { membership, attempts } = await withUser(user!.id, async (db) => ({
    membership: (await db.query<{ cohort_id: string }>("select cohort_id from public.cohort_members where user_id = $1 limit 1", [user!.id])).rows[0],
    attempts: (await db.query<{ id: string; completed_at: string; pattern: string }>("select id, completed_at, pattern from public.attempts where user_id = $1 order by completed_at desc", [user!.id])).rows,
  }));

  return (
    <div className="space-y-8 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("homeTitle")}</h1>
      {!membership ? (
        <div className="card space-y-3 p-5"><p>{t("notMember")}</p><Link href="/cohort/join" className="btn btn-primary no-underline">{t("joinTitle")}</Link></div>
      ) : (
        <>
          <p className="text-lg">{t("homeLead")}</p>
          <Link href="/cohort/start" className="btn btn-primary no-underline">{t("startFull")}</Link>
          <section aria-labelledby="attempts" className="space-y-3">
            <h2 id="attempts" className="text-2xl">{t("attempt")}s</h2>
            {attempts.length === 0 ? <p className="text-ink-muted">{t("noAttempts")}</p> : (
              <ul className="divide-y divide-line">
                {attempts.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span>{new Date(a.completed_at).toLocaleDateString(locale)} · <span className="text-ink-muted">{content.patterns[a.pattern as PatternKey]?.title ?? a.pattern}</span></span>
                    <Link href={`/cohort/results/${a.id}`} className="label">{t("view")}</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <Link href="/cohort/settings" className="label">{t("settings")}</Link>
        </>
      )}
    </div>
  );
}
