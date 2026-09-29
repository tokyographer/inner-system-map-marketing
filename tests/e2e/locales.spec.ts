import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [locale, begin, statement] of [["es", "Comenzar el trabajo", /Afirmación 1 de 63/], ["ro", "Începe lucrul", /Afirmația 1 din 63/], ["tr", "Çalışmaya başla", /İfade 1 \/ 63/]] as const) {
  test(`${locale}: landing, start and questionnaire render in ${locale} with no WCAG AA violations`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.getByRole("link", { name: begin }).click();
    const boxes = page.getByRole("checkbox");
    await page.getByRole("textbox").nth(0).fill("T");
    await page.getByRole("textbox").nth(1).fill("t@example.com");
    await boxes.nth(0).check();
    await boxes.nth(2).check();
    await page.getByRole("button").filter({ hasText: /Empezar|Începe|Başla/ }).click();
    await expect(page.getByText(statement)).toBeVisible();
    const itemText = await page.locator("fieldset p").first().textContent();
    expect(itemText).not.toMatch(/\b(the|when|with|that|myself)\b/i);
    const a = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(a.violations.map((v) => v.id)).toEqual([]);
  });
}
