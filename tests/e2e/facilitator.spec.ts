import { Pool, neonConfig } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function loadEnv(): Record<string, string> {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })); } catch { return {}; }
}
const env = loadEnv();
const enabled = Boolean(env.DATABASE_URL && env.NEON_AUTH_BASE_URL);
test.skip(!enabled, "needs Neon keys in .env.local");

test("admin creates a cohort and assigns a facilitator; facilitator sees only that cohort", async ({ browser, baseURL }) => {
  test.setTimeout(180_000);
  neonConfig.webSocketConstructor ??= globalThis.WebSocket;
  const pool = new Pool({ connectionString: env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL });
  const sql = async (q: string, p: unknown[] = []) => { const c = await pool.connect(); try { return (await c.query(q, p)).rows; } finally { c.release(); } };
  const run = Date.now().toString(36);
  const adminEmail = `admin-${run}@example.test`, facEmail = `fac-${run}@example.test`;
  const password = `Pw-${run}-long-enough!`;
  const [other] = await sql("insert into public.cohorts (name, access_code_hash, access_code_expires_at) values ($1, 'x', now() + interval '1 day') returning id", [`Other ${run}`]);
  let createdId = "";

  async function signIn(email: string) {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    let r = await page.request.post("/api/auth/sign-up/email", { data: { email, password, name: email.split("@")[0] } });
    if (!r.ok() && (await r.text()).includes("USER_ALREADY_EXISTS")) r = await page.request.post("/api/auth/sign-in/email", { data: { email, password } });
    expect(r.ok(), await r.text()).toBe(true);
    await page.goto("/en/cohort"); // ensures the profile row exists
    return page;
  }

  try {
    const admin = await signIn(adminEmail);
    const [{ id: adminId }] = await sql('select id from neon_auth."user" where email = $1', [adminEmail]);
    await sql("update public.profiles set role = 'admin' where id = $1", [adminId]);
    await signIn(facEmail);

    await admin.goto("/en/admin/cohorts");
    await expect(admin.getByRole("heading", { name: "All cohorts" })).toBeVisible();
    await admin.getByLabel("Name").fill(`E2E ${run}`);
    await admin.getByLabel("Access code valid until").fill("2030-01-01");
    await admin.getByRole("button", { name: "Create" }).click();
    await expect(admin.getByText("Give this access code")).toBeVisible();
    const code = (await admin.locator(".font-mono").first().textContent())!.trim();
    expect(code).toMatch(/^TI-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    [{ id: createdId }] = await sql("select id from public.cohorts where name = $1", [`E2E ${run}`]);

    await admin.goto(`/en/admin/cohorts/${createdId}`);
    await admin.getByLabel(/Email of a person/).fill(facEmail);
    await admin.getByRole("button", { name: "Assign" }).click();
    await expect(admin.getByRole("status")).toContainText("Assigned");
    await expect(admin.getByText(facEmail)).toBeVisible();

    const fac = await signIn(facEmail);
    await fac.goto("/en/facilitator");
    await expect(fac.getByRole("heading", { name: "Facilitator dashboard" })).toBeVisible();
    await expect(fac.getByText(`E2E ${run}`)).toBeVisible();
    await expect(fac.getByText(`Other ${run}`)).toHaveCount(0);
    await fac.goto(`/en/facilitator/cohorts/${other.id}`);
    await expect(fac.getByRole("heading", { name: "All cohorts" })).toHaveCount(0);
    expect(await fac.title()).not.toContain("Other");
    await fac.goto(`/en/facilitator/cohorts/${createdId}`);
    await expect(fac.getByText("appears once at least 5 participants")).toBeVisible();
    for (const p of [fac, admin]) expect((await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    await fac.goto("/en/admin/cohorts");
    await expect(fac.getByText("You do not have access")).toBeVisible();
    const csv = await fac.request.get(`/api/facilitator/export/${createdId}`);
    expect(csv.status()).toBe(200);
    expect(await csv.text()).not.toContain("email");
    const ident = await fac.request.get(`/api/admin/export/${createdId}`);
    expect(ident.status()).toBe(403);
    const adminCsv = await admin.request.get(`/api/admin/export/${createdId}`);
    expect(adminCsv.status()).toBe(200);
    expect((await adminCsv.text()).split("\n")[0]).toContain("email");

    await admin.goto("/en/admin/audit");
    await expect(admin.getByText("export_identified").first()).toBeVisible();
  } finally {
    if (createdId) await sql("delete from public.cohorts where id = $1", [createdId]);
    await sql('delete from public.audit_log where actor_id in (select id from neon_auth."user" where email = any($1))', [[adminEmail, facEmail]]);
    await sql("delete from public.cohorts where id = $1", [other.id]);
    await sql('delete from neon_auth."user" where email = any($1)', [[adminEmail, facEmail]]);
    await pool.end();
  }
});
