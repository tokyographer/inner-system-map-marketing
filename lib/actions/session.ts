import { currentUser, type SessionUser } from "@/lib/auth/server";
import { withUser } from "@/lib/db";

/** Signed-in user with a guaranteed profile row, or null. */
export async function userWithProfile(locale: string): Promise<SessionUser | null> {
  const user = await currentUser();
  if (!user) return null;
  await withUser(user.id, (db) => db.query("insert into public.profiles (id, locale) values ($1, $2) on conflict (id) do nothing", [user.id, locale])).catch(() => {});
  return user;
}
