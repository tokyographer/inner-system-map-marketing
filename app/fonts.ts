/**
 * Brand type from the Transcendent Institute design system:
 * Newsreader for what is felt (headings), Jost for what is navigated (body, UI).
 * Jost is brand-supplied and self-hosted; Newsreader is fetched at build by next/font.
 */
import { Newsreader } from "next/font/google";
import localFont from "next/font/local";

export const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-newsreader",
});

export const jost = localFont({
  src: [
    { path: "./fonts/Jost-VariableFont_wght.ttf", weight: "100 900", style: "normal" },
    { path: "./fonts/Jost-Italic-VariableFont_wght.ttf", weight: "100 900", style: "italic" },
  ],
  display: "swap",
  variable: "--font-jost",
});
