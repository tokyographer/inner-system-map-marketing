"use client";
import { useEffect } from "react";
import { funnel } from "../funnel";

/** Records one landing_view per visit to the landing page. */
export function LandingView() {
  useEffect(() => { funnel("landing_view"); }, []);
  return null;
}
