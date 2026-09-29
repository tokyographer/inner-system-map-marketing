/**
 * Neon Postgres access. Two entry points:
 *  - withUser(userId, fn): one transaction as the restricted role app_user with
 *    app.user_id set, so RLS policies apply to that user. Use for everything a
 *    signed-in person does.
 *  - asService(fn): the owner connection, bypassing RLS. Use only for public
 *    opt-in results, access-code lookup before sign-in, and retention.
 * Never logs SQL parameters.
 */
import { neonConfig, Pool, type PoolClient } from "@neondatabase/serverless";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. Run `npx vercel env pull .env.local` (see README).");
    neonConfig.webSocketConstructor ??= globalThis.WebSocket;
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

export type Db = Pick<PoolClient, "query">;

export async function withUser<T>(userId: string, fn: (db: Db) => Promise<T>): Promise<T> {
  if (!userId) throw new Error("withUser requires a user id");
  const client = await getPool().connect();
  try {
    await client.query("begin");
    await client.query("set local role app_user");
    await client.query("select set_config('app.user_id', $1, true)", [userId]);
    const out = await fn(client);
    await client.query("commit");
    return out;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function asService<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
