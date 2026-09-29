import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Service-role client. Server only. Bypasses RLS: use for public_results, retention and access-code lookup only. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
