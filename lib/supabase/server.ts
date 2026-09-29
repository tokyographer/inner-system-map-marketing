import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { supabasePublicEnv } from "./env";

/** Cookie-backed client for Server Components, Server Actions and Route Handlers. */
export async function createClient() {
  const { url, anonKey } = supabasePublicEnv();
  const store = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (all) => {
        try { all.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* read-only context (Server Component) */ }
      },
    },
  });
}
