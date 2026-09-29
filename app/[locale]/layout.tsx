import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { APP_NAME, type Locale } from "@/config/app";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";
import { jost, newsreader } from "@/app/fonts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = (hasLocale(routing.locales, locale) ? locale : "en") as Locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = APP_NAME[safeLocale];
  const description = t("description");
  const image = { url: "/og-image.png", width: 1200, height: 630, alt: `${title} · Transcendent Institute` };
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
    title,
    description,
    openGraph: { title, description, siteName: "Transcendent Institute", type: "website", locale: safeLocale, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <html lang={locale} className={`${newsreader.variable} ${jost.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <NextIntlClientProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-paper focus:px-3 focus:py-2">{t("skip")}</a>
        <header className="border-b border-line">
          <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-6 py-5">
            <Link href="/" className="flex items-center gap-3 no-underline" aria-label={t("home")}>
              <Image src="/brand/chakana-mark.svg" alt="" width={28} height={28} priority />
              <span className="wordmark text-[11px] sm:text-xs">{t("institute")}</span>
            </Link>
            <LocaleSwitcher />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[720px] flex-1 px-6 pb-16">
          {children}
        </main>
        <footer className="on-dark mt-16">
          <div className="mx-auto w-full max-w-[720px] px-6 py-12 text-sm">
            <p className="eyebrow mb-3">{APP_NAME[locale as Locale]}</p>
            <p className="max-w-[620px] text-[var(--ti-on-dark-2)]">{t("footer")}</p>
            <p className="mt-4"><Link href="/privacy" className="label !text-[var(--ti-on-dark-2)]">{t("privacy")}</Link></p>
          </div>
        </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
