"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { APP_NAME, type Locale } from "@/config/app";
import { shareUrl } from "../links";

type Status = "idle" | "copied" | "manual";

/** Shares the landing page URL only. Never results, scores or anything from the attempt. */
export function ShareTheMap() {
  const t = useTranslations("marketing.share");
  const locale = useLocale() as Locale;
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");

  async function share() {
    const link = shareUrl(window.location.origin, locale);
    setUrl(link);
    try {
      if (navigator.share) {
        await navigator.share({ title: APP_NAME[locale], text: t("text"), url: link });
        return;
      }
      await navigator.clipboard.writeText(link);
      setStatus("copied");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("manual");
    }
  }

  return (
    <section aria-labelledby="share" className="space-y-3">
      <h2 id="share" className="text-xl">{t("title")}</h2>
      <p>{t("body")}</p>
      <button type="button" onClick={share} className="btn btn-outline">{t("button")}</button>
      <div aria-live="polite" className="text-sm">
        {status === "copied" && <p role="status">{t("copied")}</p>}
        {status === "manual" && <p>{t("manual")} <code className="break-all">{url}</code></p>}
      </div>
    </section>
  );
}
