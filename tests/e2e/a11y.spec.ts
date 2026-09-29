import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function audit(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
}

test("landing, start, questionnaire and results have no WCAG 2.1 AA violations", async ({ page }) => {
  await page.goto("/en");
  expect(await audit(page)).toEqual([]);
  await page.goto("/en/start");
  expect(await audit(page)).toEqual([]);
  await page.getByLabel(/Your name/).fill("T");
  await page.getByLabel(/Email address/).fill("t@example.com");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("checkbox", { name: /18 or older/ }).check();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText("Statement 1 of 63")).toBeVisible();
  expect(await audit(page)).toEqual([]);

  // Seed a completed attempt directly so the results audit does not repeat the walk.
  await page.evaluate(() => {
    const ids = ["SELF1","SELF2","SELF3","SELF4","SELF5","SELF6","PERF1","PERF2","PERF3","CRIT1","CRIT2","CRIT3","PLEA1","PLEA2","PLEA3","CTRL1","CTRL2","CTRL3","INTL1","INTL2","INTL3","AVOI1","AVOI2","AVOI3","CARE1","CARE2","CARE3","HYPV1","HYPV2","HYPV3","DIST1","DIST2","DIST3","NUMB1","NUMB2","NUMB3","DISS1","DISS2","DISS3","ANGR1","ANGR2","ANGR3","IMPL1","IMPL2","IMPL3","REBL1","REBL2","REBL3","SHAM1","SHAM2","SHAM3","ABAN1","ABAN2","ABAN3","FEAR1","FEAR2","FEAR3","POWL1","POWL2","POWL3","LONE1","LONE2","LONE3"];
    const responses: Record<string, number> = {};
    ids.forEach((id, i) => { responses[id] = id.startsWith("PERF") || id.startsWith("CRIT") ? 5 : id.startsWith("SHAM") ? 3 : 1 + (i % 3); });
    sessionStorage.setItem("ism:attempt:v2", JSON.stringify({ seed: 1, form: "short", startedAt: Date.now() - 400000, completedAt: Date.now(), responses }));
  });
  await page.goto("/en/results");
  await expect(page.getByRole("heading", { name: "Who is leading?" })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.screenshot({ path: "test-results/results-360.png", fullPage: true });
  for (const path of ["/en/privacy", "/en/cohort/join", "/en/results-deleted"]) {
    await page.goto(path);
    expect(await audit(page), path).toEqual([]);
  }
  await page.goto("/en");
  await page.screenshot({ path: "test-results/landing-360.png", fullPage: true });
  await page.goto("/en/start");
  await page.screenshot({ path: "test-results/start-360.png", fullPage: true });
});
