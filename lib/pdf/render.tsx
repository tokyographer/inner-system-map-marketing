import { renderToBuffer } from "@react-pdf/renderer";
import type { Locale } from "@/config/app";
import type { Result } from "@/lib/scoring/types";
import { ResultsDocument } from "./results-document";

export async function renderResultsPdf(args: { result: Result; locale: Locale; mode: "public" | "cohort"; now?: Date }): Promise<Buffer> {
  const generatedOn = (args.now ?? new Date()).toISOString().slice(0, 10);
  return renderToBuffer(<ResultsDocument result={args.result} locale={args.locale} mode={args.mode} generatedOn={generatedOn} />);
}
