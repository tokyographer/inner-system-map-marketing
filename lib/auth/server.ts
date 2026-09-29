/**
 * Neon Auth (managed Better Auth) server instance. Sessions are HTTP-only
 * cookies signed with NEON_AUTH_COOKIE_SECRET; the catch-all handler in
 * app/api/auth/[...path] proxies the auth API.
 */
import { createNeonAuth } from "@neondatabase/auth/next/server";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set. Run \`npx vercel env pull .env.local\` and set NEON_AUTH_COOKIE_SECRET (see .env.example).`);
  return v;
}

let instance: ReturnType<typeof createNeonAuth> | null = null;

export function auth() {
  if (!instance) {
    instance = createNeonAuth({ baseUrl: env("NEON_AUTH_BASE_URL"), cookies: { secret: env("NEON_AUTH_COOKIE_SECRET") } });
  }
  return instance;
}

export interface SessionUser { id: string; email: string; name?: string | null }

/** Current signed-in user or null. Safe to call in Server Components, Actions and Route Handlers. */
export async function currentUser(): Promise<SessionUser | null> {
  try {
    const { data } = await auth().getSession();
    const u = data?.user as { id?: string; email?: string; name?: string | null } | undefined;
    return u?.id && u.email ? { id: u.id, email: u.email, name: u.name ?? null } : null;
  } catch {
    return null;
  }
}
