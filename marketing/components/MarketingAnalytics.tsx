"use client";
import { Analytics } from "@vercel/analytics/next";
import { analyticsBeforeSend } from "../analytics";

/** Vercel Web Analytics (cookieless) on the public pages only, with URLs reduced to the path plus validated utm/ref. */
export function MarketingAnalytics() {
  return <Analytics beforeSend={analyticsBeforeSend} />;
}
