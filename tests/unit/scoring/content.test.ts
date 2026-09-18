import { describe, expect, it } from "vitest";
import { TYPOLOGIES } from "@/content/typologies.en";
import { EXILES, EXILE_SECTION_COPY } from "@/content/exiles.en";
import { PATTERNS, MODIFIERS, CARE_NOTE, DISCLAIMER } from "@/content/patterns.en";
import { PAIRINGS } from "@/content/pairings";
import { EXILE_KEYS, PROTECTOR_KEYS } from "@/lib/scoring/types";

const FORBIDDEN = ["diagnos", "disorder", "clinical", "scientifically validated"];

function allText(): string {
  return JSON.stringify({ TYPOLOGIES, EXILES, EXILE_SECTION_COPY, PATTERNS, MODIFIERS, CARE_NOTE, DISCLAIMER }).toLowerCase();
}

describe("content integrity", () => {
  it("has a typology for every protector and an exile theme for every exile", () => {
    for (const k of PROTECTOR_KEYS) expect(TYPOLOGIES[k].key).toBe(k);
    for (const k of EXILE_KEYS) expect(EXILES[k].key).toBe(k);
    for (const k of PROTECTOR_KEYS) expect(PAIRINGS[k].length).toBeGreaterThan(0);
  });
  it("wound fields use tentative voice", () => {
    for (const k of PROTECTOR_KEYS) expect(TYPOLOGIES[k].wound.startsWith("Parts like this often protect")).toBe(true);
  });
  it("user-facing copy never uses forbidden words", () => {
    const text = allText();
    for (const w of FORBIDDEN) expect(text).not.toContain(w);
  });
  it("copy never labels the person ('you are a')", () => {
    expect(allText()).not.toMatch(/you are an? /);
  });
  it("exile copy never invites meeting the exile directly", () => {
    const text = JSON.stringify(EXILES).toLowerCase();
    for (const w of ["go to this part", "meet this part", "ask this part"]) expect(text).not.toContain(w);
  });
});
