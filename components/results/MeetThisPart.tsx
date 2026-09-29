"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Content } from "@/content";
import { PROTECTOR_KEYS, type ProtectorKey } from "@/lib/scoring/types";

/** Exercise for a PROTECTOR only. Throws if handed anything else. Input stays in the browser. */
export function MeetThisPart({ protectorKey, content }: { protectorKey: ProtectorKey; content: Content }) {
  if (!(PROTECTOR_KEYS as readonly string[]).includes(protectorKey)) {
    throw new Error("MeetThisPart is for protectors only.");
  }
  const t = useTranslations("results");
  const [belief, setBelief] = useState(["", "", ""]);
  const ex = content.exercise;
  const name = content.typologies[protectorKey].name;
  return (
    <section aria-labelledby="exercise" className="card space-y-4 p-5">
      <h2 id="exercise" className="text-2xl">{t("exercise")}: {name}</h2>
      <p className="text-ink-muted">{ex.intro}</p>
      <ol className="space-y-3">
        {ex.steps.map((s, i) => (
          <li key={s.key} className="space-y-1">
            <h3 className="text-lg">{i + 1}. {s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="space-y-2">
        <p>{ex.belief.intro}</p>
        <p className="flex flex-wrap items-baseline gap-2 font-serif text-lg">
          {ex.belief.template.map((word, i) => (
            <span key={word} className="flex items-baseline gap-2">
              <span>{word}</span>
              <input
                aria-label={`${word} …`}
                value={belief[i]}
                onChange={(e) => setBelief(belief.map((b, j) => (j === i ? e.target.value : b)))}
                placeholder={ex.belief.placeholder[i]}
                className="w-40 border-b border-ink bg-transparent px-1 font-sans text-base"
              />
            </span>
          ))}
        </p>
        <p className="text-xs text-ink-muted">{ex.belief.note}</p>
      </div>
    </section>
  );
}
