"use client";
import { useTranslations } from "next-intl";
import type { KeyboardEvent } from "react";
import type { Response } from "@/lib/scoring/types";

const VALUES: Response[] = [1, 2, 3, 4, 5];

interface Props {
  itemId: string;
  text: string;
  value: Response | undefined;
  onChange: (v: Response) => void;
}

/**
 * Radio group with full keyboard support: arrows move and select, digits
 * 1–5 select directly, Space/Enter select the focused option.
 */
export function LikertItem({ itemId, text, value, onChange }: Props) {
  const t = useTranslations("likert");
  const tq = useTranslations("questionnaire");

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const idx = value ? VALUES.indexOf(value) : -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); onChange(VALUES[Math.min(idx + 1, 4)]); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); onChange(VALUES[Math.max(idx - 1, 0)]); }
    else if (/^[1-5]$/.test(e.key)) { e.preventDefault(); onChange(Number(e.key) as Response); }
  }

  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">{tq("question")}</legend>
      <p id={`${itemId}-text`} className="font-serif text-[26px] leading-snug text-navy sm:text-3xl">{text}</p>
      <div role="radiogroup" aria-labelledby={`${itemId}-text`} onKeyDown={onKey} className="grid gap-2 sm:grid-cols-5">
        {VALUES.map((v) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (!value && v === 1) ? 0 : -1}
              onClick={() => onChange(v)}
              className={`min-h-[44px] rounded-[2px] border px-3 py-3 text-left text-sm transition-colors duration-[120ms] sm:text-center ${selected ? "border-navy bg-navy text-white" : "border-line bg-paper hover:bg-paper-2"}`}
            >
              <span className="mr-2 opacity-70 sm:mr-0 sm:block">{v}</span>{t(String(v))}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
