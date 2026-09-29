import { Pool, neonConfig } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

function loadEnv(): Record<string, string> {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })); } catch { return {}; }
}
const env = loadEnv();
const enabled = Boolean(env.DATABASE_URL && env.NEON_AUTH_BASE_URL);
test.skip(!enabled, "needs Neon keys in .env.local");

test("cohort mode: join → sign in → consent → full questionnaire → results → note → export → delete", async ({ page }) => {
  test.setTimeout(240_000);
  neonConfig.webSocketConstructor ??= globalThis.WebSocket;
  const pool = new Pool({ connectionString: env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL });
  const sql = async (q: string, p: unknown[] = []) => { const c = await pool.connect(); try { return (await c.query(q, p)).rows; } finally { c.release(); } };
  const run = Date.now().toString(36);
  const code = `E2E-${run}`;
  const email = `e2e-${run}@example.test`;
  const [cohort] = await sql("insert into public.cohorts (name, access_code_hash, access_code_expires_at) values ($1, app.hash_access_code($2), now() + interval '1 day') returning id", [`E2E ${run}`, code]);

  try {
    await page.goto("/en/cohort/join");
    await page.getByLabel("Access code").fill(code);
    await page.getByLabel("Email address").fill(email);
    await page.getByRole("button", { name: "Send me a sign-in code" }).click();
    await expect(page.getByRole("status")).toContainText("six-digit code");

    // The emailed code is stored hashed, so stand in for it: create the account
    // through the app's own auth handler, which sets the same session cookie.
    const signUp = await page.request.post("/api/auth/sign-up/email", { data: { email, password: `Pw-${run}-long-enough!`, name: "E2E" } });
    expect(signUp.ok(), await signUp.text()).toBe(true);

    await page.goto("/en/cohort/consent");
    await expect(page.getByRole("heading", { name: "Before we store anything" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("tick the first box");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/en\/cohort$/);
    await expect(page.getByText("You have not taken the questionnaire yet.")).toBeVisible();
    await page.getByRole("link", { name: /full form/ }).click();
    await page.getByRole("checkbox", { name: /18 or older/ }).check();
    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByText("Statement 1 of 84")).toBeVisible();
    for (let i = 1; i <= 84; i++) {
      await expect(page.getByText(`Statement ${i} of 84`)).toBeVisible();
      await page.getByRole("radiogroup").getByRole("radio").nth((i * 3) % 5).click();
      if (i < 84) await expect(page.getByText(`Statement ${i + 1} of 84`)).toBeVisible();
    }
    await page.getByRole("button", { name: "See my map" }).click();

    await expect(page).toHaveURL(/\/en\/cohort\/results\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { name: "Who is leading?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "In Level II" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Email me my results" })).toHaveCount(0);
    await page.getByRole("textbox").last().fill("A note for myself.");
    await page.getByRole("button", { name: "Save note" }).click();
    await expect(page.getByRole("status")).toContainText("Saved");

    await page.goto("/en/cohort");
    await expect(page.getByRole("link", { name: "View" })).toHaveCount(1);
    await page.getByRole("link", { name: "Your data" }).click();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download everything as JSON" }).click()]);
    expect(download.suggestedFilename()).toBe("inner-system-map-export.json");

    await page.getByLabel("Type DELETE to confirm").fill("DELETE");
    await page.getByRole("button", { name: "Delete my account and all my data" }).click();
    await expect(page).toHaveURL(/\/en$/);
    expect(await sql('select 1 from neon_auth."user" where email = $1', [email])).toEqual([]);
    expect(await sql("select 1 from public.attempts where cohort_id = $1", [cohort.id])).toEqual([]);
  } finally {
    await sql("delete from public.cohorts where id = $1", [cohort.id]);
    await sql('delete from neon_auth."user" where email = $1', [email]);
    await pool.end();
  }
});
