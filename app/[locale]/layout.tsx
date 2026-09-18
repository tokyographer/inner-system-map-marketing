import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { APP_NAME, type Locale } from "@/config/app";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: APP_NAME[(hasLocale(routing.locales, locale) ? locale : "en") as Locale], description: t("description") };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <NextIntlClientProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-paper focus:px-3 focus:py-2">{t("skip")}</a>
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
          <Link href="/" className="font-serif text-lg">{APP_NAME[locale as Locale]}</Link>
          <LocaleSwitcher />
        </header>
        <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-16">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-3xl px-4 py-8 text-sm text-ink-muted">
          <p>{t("footer")}</p>
        </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
