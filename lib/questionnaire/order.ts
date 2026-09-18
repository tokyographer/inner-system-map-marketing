/**
 * Seeded, reproducible item order with two constraints:
 *  - no two consecutive items from the same scale
 *  - no more than two exile items in any run of five
 */
import { itemsForForm, type Item } from "@/content/items.v2";

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newSeed(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}

export function violates(placed: Item[], candidate: Item): boolean {
  const last = placed[placed.length - 1];
  if (last && last.scale === candidate.scale) return true;
  if (candidate.block === "exiles") {
    const window = placed.slice(-4);
    const exiles = window.filter((it) => it.block === "exiles").length;
    if (exiles >= 2) return true;
  }
  return false;
}

export function orderItems(form: "full" | "short", seed: number): Item[] {
  const pool = itemsForForm(form);
  for (let attempt = 0; attempt < 200; attempt++) {
    const rand = mulberry32(seed + attempt * 7919);
    const remaining = [...pool];
    const placed: Item[] = [];
    let stuck = false;
    while (remaining.length > 0) {
      const candidates = remaining.filter((it) => !violates(placed, it));
      if (candidates.length === 0) { stuck = true; break; }
      const pick = candidates[Math.floor(rand() * candidates.length)];
      placed.push(pick);
      remaining.splice(remaining.indexOf(pick), 1);
    }
    if (!stuck) return placed;
  }
  throw new Error("Could not build a valid item order; check the item bank constraints.");
}
