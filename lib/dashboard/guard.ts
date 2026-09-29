import { currentUser, type SessionUser } from "@/lib/auth/server";
import type { AppRole } from "@/lib/db/types";
import { roleOf } from "./queries";

/** Returns the user and role when signed in with one of the allowed roles, otherwise null. */
export async function requireRole(allowed: AppRole[]): Promise<{ user: SessionUser; role: AppRole } | null> {
  const user = await currentUser();
  if (!user) return null;
  const role = await roleOf(user.id);
  return role && allowed.includes(role) ? { user, role } : null;
}
