import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { LOCALES } from "@/config/app";
import { ALL_ITEM_IDS, getContent, itemText } from "@/content";
import { ITEMS } from "@/content/items.v2";
import { ITEM_TEXT_ES } from "@/content/items.v2.es";
import { ITEM_TEXT_RO } from "@/content/items.v2.ro";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import ro from "@/messages/ro.json";
import { EXILE_KEYS, PROTECTOR_KEYS } from "@/lib/scoring/types";

const FORBIDDEN: Record<string, string[]> = {
  en: ["diagnos", "disorder", "clinical", "scientifically validated"],
  es: ["diagnós", "diagnos", "trastorno", "clínic", "validado científicamente", "validada científicamente"],
  ro: ["diagnostic", "tulburare", "clinic", "validat științific"],
};
const KEEP_UNTRANSLATED = ["Yesod", "Tiferet", "Kay Pacha"];

function flatKeys(o: unknown, prefix = ""): string[] {
  if (typeof o !== "object" || o === null) return [prefix];
  return Object.entries(o as Record<string, unknown>).filter(([k]) => k !== "_comment").flatMap(([k, v]) => flatKeys(v, prefix ? `${prefix}.${k}` : k));
}

describe("locale completeness", () => {
  it("ES and RO translate every item ID and nothing else", () => {
    for (const map of [ITEM_TEXT_ES, ITEM_TEXT_RO]) {
      expect(Object.keys(map).sort()).toEqual([...ALL_ITEM_IDS].sort());
      for (const id of ALL_ITEM_IDS) expect(map[id].trim().length).toBeGreaterThan(10);
    }
  });
  it("itemText falls back to English only for en", () => {
    const abn = ITEMS.find((i) => i.id === "ABAN1")!;
    expect(itemText(abn, "en")).toBe(abn.text);
    expect(itemText(abn, "es")).not.toBe(abn.text);
    expect(itemText(abn, "ro")).not.toBe(abn.text);
  });
  it("every locale has all typologies, exiles, patterns, modifiers and exercise steps", () => {
    for (const locale of LOCALES) {
      const c = getContent(locale);
      for (const k of PROTECTOR_KEYS) { expect(c.typologies[k].key).toBe(k); expect(c.typologies[k].wound.length).toBeGreaterThan(20); }
      for (const k of EXILE_KEYS) expect(c.exiles[k].key).toBe(k);
      expect(Object.keys(c.patterns)).toHaveLength(6);
      expect(Object.keys(c.modifiers)).toHaveLength(2);
      expect(c.exercise.steps.map((s) => s.key)).toEqual(["S", "W", "C", "I", "R"]);
      expect(c.exercise.belief.template).toHaveLength(3);
    }
  });
  it("ES and RO message files have exactly the EN key set", () => {
    const base = flatKeys(en).sort();
    expect(flatKeys(es).sort()).toEqual(base);
    expect(flatKeys(ro).sort()).toEqual(base);
  });
  it("no forbidden words in any locale, in content or messages", () => {
    const msgs = { en, es, ro } as const;
    for (const locale of LOCALES) {
      const text = JSON.stringify({ c: getContent(locale), m: msgs[locale], items: ITEMS.map((i) => itemText(i, locale)) }).toLowerCase();
      for (const w of FORBIDDEN[locale]) expect(text, `${locale}: ${w}`).not.toContain(w);
    }
  });
  it("specialised terms stay untranslated and Self stays capitalised", () => {
    for (const locale of ["es", "ro"] as const) {
      const lvl = getContent(locale).levelTwo.body;
      for (const term of KEEP_UNTRANSLATED) expect(lvl).toContain(term);
      expect(getContent(locale).selfNote).toMatch(/Self/);
    }
  });
  it("translation files carry the draft header", () => {
    for (const f of ["content/items.v2.es.ts", "content/items.v2.ro.ts", "content/typologies.es.ts", "content/typologies.ro.ts", "content/exiles.es.ts", "content/exiles.ro.ts", "content/patterns.es.ts", "content/patterns.ro.ts"]) {
      expect(readFileSync(f, "utf8")).toContain("DRAFT, pending human review");
    }
    expect((es as { _comment?: string })._comment).toContain("DRAFT");
    expect((ro as { _comment?: string })._comment).toContain("DRAFT");
  });
});
