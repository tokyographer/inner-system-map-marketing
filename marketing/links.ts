/**
 * Outbound links from the map, tagged so the program site can attribute them,
 * and inbound partner links. Pure functions.
 */
import type { Locale } from "@/config/app";
import { LIVE_SESSION_URL, MAP_UTM_SOURCE, PROGRAM_URL } from "./config";
import { REF_CODE } from "./validation";

export function withUtm(url: string, medium: string, campaign: string, content: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", MAP_UTM_SOURCE);
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", campaign);
  u.searchParams.set("utm_content", content);
  return u.toString();
}

export function programInviteUrl(locale: Locale, urls: Record<Locale, string> = PROGRAM_URL): string {
  return withUtm(urls[locale], "results", "program-invite", locale);
}

/** null when no live session is configured for the locale. */
export function liveSessionUrl(locale: Locale, urls: Record<Locale, string> = LIVE_SESSION_URL): string | null {
  return urls[locale] ? withUtm(urls[locale], "results", "live-session", locale) : null;
}

/** `/{locale}?ref=CODE` on the given origin. Throws on a code partners could not type back. */
export function partnerLink(origin: string, locale: Locale, code: string): string {
  if (!REF_CODE.test(code)) throw new Error(`Invalid partner code "${code}": use 2–32 lowercase letters, digits or hyphens.`);
  const u = new URL(`/${locale}`, origin);
  u.searchParams.set("ref", code);
  return u.toString();
}
