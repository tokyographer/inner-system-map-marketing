import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LOCALES } from "@/config/app";

/** Magic-link landing. Accepts a PKCE `code` (email link) or a `token_hash` (server-generated link); continues to `next` (same-origin only). */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/en/cohort";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/en/cohort";
  const locale = LOCALES.find((l) => safeNext.startsWith(`/${l}/`) || safeNext === `/${l}`) ?? "en";

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (!code && !tokenHash) return NextResponse.redirect(`${origin}/${locale}/cohort/join?error=missing_code`);
  const supabase = await createClient();
  const { error } = tokenHash
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: (type as "magiclink" | "email") ?? "magiclink" })
    : await supabase.auth.exchangeCodeForSession(code!);
  if (error) {
    console.error("auth callback failed", { reason: error.message });
    return NextResponse.redirect(`${origin}/${locale}/cohort/join?error=link_invalid`);
  }
  return NextResponse.redirect(`${origin}${safeNext}`);
}
