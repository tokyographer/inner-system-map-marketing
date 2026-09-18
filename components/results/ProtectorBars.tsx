"use client";
import { useTranslations } from "next-intl";
import type { Content } from "@/content";
import { FIREFIGHTER_KEYS, MANAGER_KEYS, MIXED_KEYS, type ProtectorKey, type Result } from "@/lib/scoring/types";
import { Bar } from "./Bar";

export function useBandLabel() {
  const t = useTranslations("results");
  return (band: "quiet" | "present" | "veryActive") => ({ quiet: t("bandQuiet"), present: t("bandPresent"), veryActive: t("bandVeryActive") }[band]);
}

function Group({ title, keys, color, result, content }: { title: string; keys: readonly ProtectorKey[]; color: string; result: Result; content: Content }) {
  const band = useBandLabel();
  const sorted = [...keys].sort((a, b) => result.protectors.ranked.indexOf(a) - result.protectors.ranked.indexOf(b));
  return (
    <div className="space-y-2">
      <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      {sorted.map((k) => <Bar key={k} label={content.typologies[k].name} value={result.scales[k].mean} display={result.scales[k].display} band={band(result.scales[k].band)} color={color} />)}
    </div>
  );
}

export function ProtectorBars({ result, content }: { result: Result; content: Content }) {
  const t = useTranslations("results");
  return (
    <section aria-labelledby="profile" className="space-y-6">
      <h2 id="profile" className="text-2xl">{t("protectorProfile")}</h2>
      <Group title={t("managers")} keys={MANAGER_KEYS} color="var(--manager)" result={result} content={content} />
      <Group title={t("firefighters")} keys={FIREFIGHTER_KEYS} color="var(--firefighter)" result={result} content={content} />
      <Group title={t("mixed")} keys={MIXED_KEYS} color="var(--manager)" result={result} content={content} />
    </section>
  );
}
