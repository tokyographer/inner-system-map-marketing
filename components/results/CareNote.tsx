"use client";
import { useTranslations } from "next-intl";
import type { Content } from "@/content";

export function CareNote({ content, withResources }: { content: Content; withResources: boolean }) {
  const t = useTranslations("support");
  return (
    <aside className="card card-warm space-y-3 p-5" aria-label={t("title")}>
      <p>{content.careNote}</p>
      {withResources && (
        <div>
          <h2 className="text-lg">{t("title")}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {content.support.map((r) => (
              <li key={r.name}>{r.url ? <a href={r.url} className="underline">{r.name}</a> : r.name}: {r.detail}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
