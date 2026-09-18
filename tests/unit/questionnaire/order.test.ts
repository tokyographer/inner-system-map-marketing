import { describe, expect, it } from "vitest";
import { orderItems, violates } from "@/lib/questionnaire/order";
import { itemsForForm } from "@/content/items.v2";

function check(form: "full" | "short", seed: number) {
  const order = orderItems(form, seed);
  expect(order).toHaveLength(itemsForForm(form).length);
  expect(new Set(order.map((i) => i.id)).size).toBe(order.length);
  for (let i = 1; i < order.length; i++) expect(order[i].scale).not.toBe(order[i - 1].scale);
  for (let i = 0; i + 5 <= order.length; i++) {
    const exiles = order.slice(i, i + 5).filter((it) => it.block === "exiles").length;
    expect(exiles).toBeLessThanOrEqual(2);
  }
  return order;
}

describe("item order", () => {
  it("satisfies both constraints for many seeds, both forms", () => {
    for (let seed = 1; seed <= 200; seed++) { check("full", seed); check("short", seed * 31); }
  });
  it("is reproducible from the seed and differs between seeds", () => {
    const a = orderItems("short", 42).map((i) => i.id);
    const b = orderItems("short", 42).map((i) => i.id);
    const c = orderItems("short", 43).map((i) => i.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
  it("violates() detects same-scale adjacency and exile density", () => {
    const items = itemsForForm("full");
    const perf = items.filter((i) => i.scale === "PERF");
    const exiles = items.filter((i) => i.block === "exiles");
    expect(violates([perf[0]], perf[1])).toBe(true);
    expect(violates([perf[0]], exiles[0])).toBe(false);
    expect(violates([exiles[0], perf[0], exiles[4], perf[1]], exiles[8])).toBe(true);
    expect(violates([exiles[0], perf[0], perf[1], perf[2], perf[3]], exiles[8])).toBe(false);
  });
});
