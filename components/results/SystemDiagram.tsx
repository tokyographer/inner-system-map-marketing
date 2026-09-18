"use client";
import { useTranslations } from "next-intl";
import type { Result } from "@/lib/scoring/types";

/** Self at the centre, exile feelings around it, firefighters, then managers as the outer ring. */
export function SystemDiagram({ result }: { result: Result }) {
  const t = useTranslations("results");
  const r = (mean: number, min: number, max: number) => min + ((mean - 1) / 4) * (max - min);
  const self = r(result.self.mean, 10, 34);
  const exile = r(result.leads.exile, 4, 22);
  const fire = r(result.leads.firefighter, 4, 22);
  const man = r(result.leads.manager, 4, 22);
  const rExile = 36 + exile / 2, rFire = 36 + exile + 4 + fire / 2, rMan = 36 + exile + 4 + fire + 4 + man / 2;
  return (
    <svg viewBox="0 0 240 240" role="img" aria-label={t("visualAlt")} className="mx-auto w-full max-w-[280px]">
      <circle cx="120" cy="120" r={rMan} fill="none" stroke="var(--manager)" strokeWidth={man} opacity="0.85" />
      <circle cx="120" cy="120" r={rFire} fill="none" stroke="var(--firefighter)" strokeWidth={fire} opacity="0.85" />
      <circle cx="120" cy="120" r={rExile} fill="none" stroke="var(--exile)" strokeWidth={exile} opacity="0.85" />
      <circle cx="120" cy="120" r={self} fill="var(--self)" />
    </svg>
  );
}
