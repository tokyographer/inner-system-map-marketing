"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { supabasePublicEnv } from "./env";

export function createClient() {
  const { url, anonKey } = supabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
