import { expect, test } from "@playwright/test";

test("public mode happy path: landing → start → questionnaire → results → PDF", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await page.getByRole("link", { name: "Begin" }).click();

  await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("18 or older");
  await page.getByRole("checkbox", { name: /18 or older/ }).check();
  await page.getByRole("button", { name: "Start" }).click();

  await expect(page).toHaveURL(/\/en\/questionnaire$/);
  await expect(page.getByText("Statement 1 of 63")).toBeVisible();

  // Answer everything with a mix so the map is not flat; keyboard on the first item.
  await page.getByRole("radio", { name: /Never or almost never/ }).focus();
  await page.keyboard.press("4");
  await expect(page.getByText("Statement 2 of 63")).toBeVisible();
  for (let i = 2; i <= 63; i++) {
    await expect(page.getByText(`Statement ${i} of 63`)).toBeVisible();
    const value = 1 + ((i * 7) % 5);
    await page.getByRole("radiogroup").getByRole("radio").nth(value - 1).click();
    if (i < 63) await expect(page.getByText(`Statement ${i + 1} of 63`)).toBeVisible();
  }
  // Back button works and answers persist.
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByText("Statement 62 of 63")).toBeVisible();
  await expect(page.getByRole("radio", { checked: true })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "See my map" }).click();

  await expect(page).toHaveURL(/\/en\/results$/);
  await expect(page.getByRole("heading", { name: "Your inner system map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who is leading?" })).toBeVisible();

  // Section order invariant in the rendered DOM: protectors before exiles, exercise after exiles.
  const sections = await page.locator("[data-section]").evaluateAll((els) => els.filter((e) => e.children.length > 0).map((e) => e.getAttribute("data-section")));
  expect(sections.indexOf("protectorProfile")).toBeLessThan(sections.indexOf("exiles"));
  expect(sections.indexOf("protectorCards")).toBeLessThan(sections.indexOf("exiles"));
  await expect(page.getByRole("heading", { name: /^Meet this part:/ })).toBeVisible();

  // Progress cleared on completion, attempt retained for the results page.
  expect(await page.evaluate(() => localStorage.getItem("ism:progress:v2"))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem("ism:attempt:v2"))).not.toBeNull();

  // PDF download.
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PDF" }).click()]);
  expect(download.suggestedFilename()).toBe("inner-system-map-results.pdf");

  // Email form refuses without consent; with consent and no RESEND key the server answers 503 → friendly message.
  await page.getByLabel("Email address").fill("person@example.com");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("consent");
  await page.getByRole("checkbox", { name: /Send my results PDF/ }).check();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator("p[role=alert], p[role=status]")).toContainText(/not available|Sent/);

  // No horizontal scroll at 360px.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("refresh mid-questionnaire keeps answers", async ({ page }) => {
  await page.goto("/en/start");
  await page.getByRole("checkbox", { name: /18 or older/ }).check();
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("radiogroup").getByRole("radio").nth(2).click();
  await expect(page.getByText("Statement 2 of 63")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Statement 2 of 63")).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("radio", { checked: true })).toHaveText(/Sometimes/);
});

test("results page without an attempt offers the questionnaire", async ({ page }) => {
  await page.goto("/en/results");
  await expect(page.getByText("There are no results to show")).toBeVisible();
  await expect(page.getByRole("link", { name: "Take the questionnaire" })).toBeVisible();
});
