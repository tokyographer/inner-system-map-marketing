import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContent } from "@/content";
import type { Locale } from "@/config/app";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PatternKey } from "@/lib/scoring/types";

export default async function CohortHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/cohort/join", locale });
  const t = await getTranslations("cohort");
  const content = getContent(locale as Locale);

  const { data: memberships } = await supabase.from("cohort_members").select("cohort_id, cohorts(name, level)").eq("user_id", user!.id);
  const { data: attempts } = await supabase.from("attempts").select("id, completed_at, pattern, form").eq("user_id", user!.id).order("completed_at", { ascending: false });
  const membership = memberships?.[0];

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
            {!attempts?.length ? <p className="text-ink-muted">{t("noAttempts")}</p> : (
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
