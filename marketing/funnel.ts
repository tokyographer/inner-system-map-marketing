/**
 * One call per funnel step from the app's hooks: adds the page locale and the
 * partner code from the attribution, sends the analytics event and, for starts
 * and completions, bumps the anonymous per-partner counter. Never throws.
 */
import { loadAttribution } from "./attribution";
import { trackFunnel, type FunnelEvent, type FunnelProps } from "./analytics";
import type { CountedEvent } from "./validation";

const COUNTED: Partial<Record<FunnelEvent, CountedEvent>> = { start: "start", completion: "complete" };

export function funnel(event: FunnelEvent, extra: Pick<FunnelProps, "target"> = {}): void {
  if (typeof document === "undefined") return;
  const ref = loadAttribution()?.ref;
  trackFunnel(event, { locale: document.documentElement.lang, ...(ref ? { ref } : {}), ...extra });
  const counted = COUNTED[event];
  if (counted) {
    try {
      // keepalive: the start form navigates away immediately.
      void fetch("/api/marketing/funnel", { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ event: counted, ...(ref ? { ref } : {}) }) }).catch(() => {});
    } catch { /* counting must never break the page */ }
  }
}
