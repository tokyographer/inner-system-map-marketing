import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { deletePublicResult, hashToken, storePublicResult } from "@/lib/public-results/store";
import { asService } from "@/lib/db";
import { score } from "@/lib/scoring";
import { build } from "../unit/scoring/helpers";

function loadEnv() {
  try { return Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })); } catch { return {}; }
}
const env = loadEnv();
if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;

describe.skipIf(!env.DATABASE_URL || process.env.ALLOW_DB_WRITES !== "1")("public opt-in results (Neon)", () => {
  it("stores with a hashed token, expires in 6 months, and deletes by the plain token only", async () => {
    const responses = build("short", {}, 3);
    const result = score({ form: "short", responses });
    const email = `pub-${Date.now().toString(36)}@example.test`;
    const stored = await storePublicResult({ email, locale: "en", form: "short", responses, result, newsletter: false, policyVersion: "t" });
    expect(stored.deleteToken.length).toBeGreaterThanOrEqual(24);
    const monthsAhead = (stored.expiresAt.getTime() - Date.now()) / (30 * 864e5);
    expect(monthsAhead).toBeGreaterThan(5.5);
    expect(monthsAhead).toBeLessThan(6.5);
    const row = await asService(async (db) => (await db.query<{ delete_token_hash: string; email: string }>("select delete_token_hash, email from public.public_results where id = $1", [stored.id])).rows[0]);
    expect(row.delete_token_hash).toBe(hashToken(stored.deleteToken));
    expect(row.delete_token_hash).not.toContain(stored.deleteToken);
    expect(await deletePublicResult("wrong-token-wrong-token-wrong")).toBe(false);
    expect(await deletePublicResult(stored.deleteToken)).toBe(true);
    expect(await deletePublicResult(stored.deleteToken)).toBe(false);
    const gone = await asService(async (db) => (await db.query("select 1 from public.public_results where id = $1", [stored.id])).rows);
    expect(gone).toEqual([]);
  });
});
