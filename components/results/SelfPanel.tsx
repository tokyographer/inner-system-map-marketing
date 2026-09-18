"use client";
import { useTranslations } from "next-intl";
import type { Content } from "@/content";
import type { Result } from "@/lib/scoring/types";

export function SelfPanel({ result, content }: { result: Result; content: Content }) {
  const t = useTranslations("results");
  const band = { hardToReach: t("selfHardToReach"), availableAtTimes: t("selfAvailableAtTimes"), oftenAvailable: t("selfOftenAvailable") }[result.self.band];
  return (
    <section aria-labelledby="self" className="space-y-2">
      <h2 id="self" className="text-2xl">{t("selfPanel")}</h2>
      <p className="text-lg">{t("selfScore", { band, value: result.self.display })}</p>
      <p className="text-ink-muted">{content.selfNote}</p>
    </section>
  );
}
