import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

function loadEnv(): Record<string, string> {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })); } catch { return {}; }
}
const env = loadEnv();
const enabled = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

test.skip(!enabled, "needs local Supabase keys in .env.local");

test("cohort mode: join → magic link → consent → full questionnaire → results → note → export → delete", async ({ page, baseURL }) => {
  test.setTimeout(180_000);
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const run = Date.now().toString(36);
  const code = `E2E-${run}`;
  const email = `e2e-${run}@example.test`;
  const { data: hash } = await admin.rpc("hash_access_code", { p_code: code });
  const { data: cohort } = await admin.from("cohorts").insert({ name: `E2E ${run}`, access_code_hash: hash!, access_code_expires_at: new Date(Date.now() + 864e5).toISOString() }).select("id").single();

  try {
    await page.goto("/en/cohort/join");
    await page.getByLabel("Access code").fill(code);
    await page.getByLabel("Email address").fill(email);
    await page.getByRole("button", { name: "Send me a sign-in link" }).click();
    await expect(page.getByRole("status")).toContainText("Check your inbox");

    // Stand in for the email: generate the link server-side and open it.
    const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    expect(error).toBeNull();
    await page.goto(`${baseURL}/auth/callback?token_hash=${link!.properties!.hashed_token}&type=magiclink&next=/en/cohort/consent`);
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
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    expect(users.users.find((u) => u.email === email)).toBeUndefined();
  } finally {
    await admin.from("cohorts").delete().eq("id", cohort!.id);
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const u = users.users.find((x) => x.email === email);
    if (u) await admin.auth.admin.deleteUser(u.id);
  }
});
