/**
 * Applies db/migrations/*.sql in filename order, once each, tracked in
 * public.schema_migrations. Run: npm run db:migrate (loads .env.local).
 * Idempotent; safe to run on every deploy.
 */
import { neonConfig, Pool } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) { console.error("Set DATABASE_URL (npx vercel env pull .env.local)."); process.exit(1); }
neonConfig.webSocketConstructor ??= globalThis.WebSocket;

const dir = join(process.cwd(), "db", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  await client.query("create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  const { rows } = await client.query("select name from public.schema_migrations");
  const done = new Set(rows.map((r) => r.name));
  for (const f of files) {
    if (done.has(f)) { console.log(`skip  ${f}`); continue; }
    const sql = readFileSync(join(dir, f), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (name) values ($1)", [f]);
      await client.query("commit");
      console.log(`apply ${f}`);
    } catch (e) {
      await client.query("rollback");
      console.error(`FAILED ${f}: ${e.message}`);
      process.exit(1);
    }
  }
} finally {
  client.release();
  await pool.end();
}
