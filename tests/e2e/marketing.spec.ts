import { expect, test, type Page } from "@playwright/test";

const SHORT_IDS = ["SELF1","SELF2","SELF3","SELF4","SELF5","SELF6","PERF1","PERF2","PERF3","CRIT1","CRIT2","CRIT3","PLEA1","PLEA2","PLEA3","CTRL1","CTRL2","CTRL3","INTL1","INTL2","INTL3","AVOI1","AVOI2","AVOI3","CARE1","CARE2","CARE3","HYPV1","HYPV2","HYPV3","DIST1","DIST2","DIST3","NUMB1","NUMB2","NUMB3","DISS1","DISS2","DISS3","ANGR1","ANGR2","ANGR3","IMPL1","IMPL2","IMPL3","REBL1","REBL2","REBL3","SHAM1","SHAM2","SHAM3","ABAN1","ABAN2","ABAN3","FEAR1","FEAR2","FEAR3","POWL1","POWL2","POWL3","LONE1","LONE2","LONE3"];

/** Seeds a finished attempt so the results page renders without walking 63 items. `value` sets every answer. */
async function seedAttempt(page: Page, value: (id: string, i: number) => number) {
  const responses = Object.fromEntries(SHORT_IDS.map((id, i) => [id, value(id, i)]));
  await page.evaluate((r) => sessionStorage.setItem("ism:attempt:v2", JSON.stringify({ seed: 1, form: "short", startedAt: Date.now() - 400000, completedAt: Date.now(), responses: r })), responses);
}

async function startWithContact(page: Page) {
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Email address").fill("person@example.com");
  await page.getByRole("checkbox", { name: /Send my results PDF/ }).check();
  await page.getByRole("checkbox", { name: /18 or older/ }).check();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page).toHaveURL(/\/en\/questionnaire$/);
}

test("utm and ref from the landing URL travel with the results request", async ({ page }) => {
  await page.goto("/en?utm_source=newsletter&utm_medium=email&utm_campaign=level-ii&ref=Studio-Om");
  await page.getByRole("link", { name: "Begin the work" }).click();
  await expect(page.getByRole("heading", { name: "Before you begin" })).toBeVisible();
  // Nothing is stored on the device before the person submits the start form.
  expect(await page.evaluate(() => localStorage.getItem("ism:mkt:attribution:v1"))).toBeNull();
  await startWithContact(page);
  expect(await page.evaluate(() => localStorage.getItem("ism:mkt:attribution:v1"))).not.toBeNull();

  let emailBody: Record<string, unknown> | null = null;
  await page.route("**/api/public/email-results", async (route) => { emailBody = route.request().postDataJSON(); await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, copySentToInstitute: true }) }); });
  await seedAttempt(page, (_, i) => 1 + (i % 5));
  await page.goto("/en/results");
  await expect(page.getByRole("status")).toContainText("sent to person@example.com");
  expect(emailBody).toMatchObject({ consent: { policyVersion: "2026-09-draft+m2026-10-draft" }, attribution: { utmSource: "newsletter", utmMedium: "email", utmCampaign: "level-ii", ref: "studio-om" } });
});

/** Custom events queued for Vercel Web Analytics on this page load (the script itself is not served locally). */
async function queuedEvents(page: Page) {
  return page.evaluate(() => ((window as unknown as { vaq?: [string, { name?: string; data?: Record<string, string> }?][] }).vaq ?? [])
    .filter(([kind]) => kind === "event").map(([, e]) => ({ name: e?.name, data: e?.data })));
}

test("funnel events carry locale and partner code only, never contact details or results", async ({ page }) => {
  await page.goto("/en?ref=studio-om&utm_source=newsletter");
  await expect.poll(() => queuedEvents(page)).toContainEqual({ name: "landing_view", data: { locale: "en", ref: "studio-om" } });
  // The URL sanitiser is queued before any event, so the script never sends an unsanitised URL.
  expect(await page.evaluate(() => ((window as unknown as { vaq: unknown[][] }).vaq)[0][0])).toBe("beforeSend");

  await page.getByRole("link", { name: "Begin the work" }).click();
  await startWithContact(page);
  await page.route("**/api/public/email-results", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, copySentToInstitute: true }) }));
  await seedAttempt(page, (_, i) => 1 + (i % 5));
  await page.goto("/en/results");
  await expect(page.getByRole("status")).toContainText("sent to person@example.com");
  await expect.poll(() => queuedEvents(page)).toContainEqual({ name: "email_sent", data: { locale: "en", ref: "studio-om" } });

  const all = JSON.stringify(await page.evaluate(() => (window as unknown as { vaq?: unknown }).vaq ?? []));
  for (const forbidden of ["person@example.com", "Test Person", "MANAGED", "FLOODED", "REACTIVE", "POLARISED", "responses"]) expect(all).not.toContain(forbidden);
});

const EXILE_SCALES = ["SHAM", "ABAN", "FEAR", "POWL", "LONE"];

test("program invite links to the locale's program page with UTM tags; no live-session link while none is configured", async ({ page }) => {
  await page.goto("/es");
  await seedAttempt(page, (_, i) => 1 + (i % 5));
  await page.goto("/es/results");
  const link = page.locator("[data-section=invite] a").first();
  await expect(link).toBeVisible();
  const href = new URL((await link.getAttribute("href"))!);
  expect(Object.fromEntries(href.searchParams)).toEqual({ utm_source: "inner-system-map", utm_medium: "results", utm_campaign: "program-invite", utm_content: "es" });
  await expect(page.locator("[data-section=invite] a")).toHaveCount(1);
});

test("no program invite when the pattern is FLOODED", async ({ page }) => {
  await page.goto("/en");
  await seedAttempt(page, (id) => (EXILE_SCALES.some((s) => id.startsWith(s)) ? 5 : id.startsWith("SELF") ? 1 : 3));
  await page.goto("/en/results");
  await expect(page.getByRole("heading", { name: "Support near you" })).toBeVisible();
  await expect(page.locator("[data-section=invite] a")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "If you want to go further" })).toHaveCount(0);
});
