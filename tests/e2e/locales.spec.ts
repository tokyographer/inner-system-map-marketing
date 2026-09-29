import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [locale, begin, statement] of [["es", "Comenzar el trabajo", /Afirmación 1 de 63/], ["ro", "Începe lucrul", /Afirmația 1 din 63/]] as const) {
  test(`${locale}: landing, start and questionnaire render in ${locale} with no WCAG AA violations`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.getByRole("link", { name: begin }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button").filter({ hasText: /Empezar|Începe/ }).click();
    await expect(page.getByText(statement)).toBeVisible();
    const itemText = await page.locator("fieldset p").first().textContent();
    expect(itemText).not.toMatch(/\b(I|my|me)\b/);
    const a = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(a.violations.map((v) => v.id)).toEqual([]);
  });
}
