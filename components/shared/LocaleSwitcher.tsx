"use client";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES } from "@/config/app";
import { Link, usePathname } from "@/i18n/navigation";

const NAMES: Record<string, string> = { en: "English", es: "Español", ro: "Română" };

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <nav aria-label={t("language")} className="flex gap-2 text-sm">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded px-2 py-1 ${l === locale ? "bg-paper-2 font-semibold" : "text-ink-muted hover:text-ink"}`}
        >
          {NAMES[l]}
        </Link>
      ))}
    </nav>
  );
}
