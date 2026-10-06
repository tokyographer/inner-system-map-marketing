import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/config/app";
import { PRIVACY } from "@/content/legal/privacy";
import { MarketingPrivacy } from "@/marketing/components/MarketingPrivacy";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = PRIVACY[locale as Locale] ?? PRIVACY.en;
  return (
    <article className="space-y-8 py-10">
      <h1 className="text-[34px] sm:text-4xl">{page.title}</h1>
      <p className="card card-warm p-4 text-sm">{page.notice}</p>
      <p className="text-sm text-ink-muted">{page.updated}</p>
      {page.sections.map((s) => (
        <section key={s.heading} className="space-y-2">
          <h2 className="text-2xl">{s.heading}</h2>
          {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
      <MarketingPrivacy />
    </article>
  );
}
