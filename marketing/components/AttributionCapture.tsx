"use client";
import { useEffect } from "react";
import { captureAttribution } from "../attribution";

/** Mounted in the locale layout so any entry page (landing, a partner link, /start from an ad) records utm_* and ref. */
export function AttributionCapture() {
  useEffect(() => { captureAttribution(window.location.search); }, []);
  return null;
}
