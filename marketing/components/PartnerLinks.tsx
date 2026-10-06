"use client";
import { useSyncExternalStore } from "react";
import { LOCALES } from "@/config/app";
import { partnerLink } from "../links";

const noop = () => () => {};

/** The partner's link in each language, on this site's origin (path only during server render). */
export function PartnerLinks({ code }: { code: string }) {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  return (
    <ul className="space-y-1">
      {LOCALES.map((l) => {
        const url = partnerLink(origin || "http://placeholder.invalid", l, code);
        return <li key={l}><code className="break-all text-xs">{origin ? url : url.replace("http://placeholder.invalid", "")}</code></li>;
      })}
    </ul>
  );
}
