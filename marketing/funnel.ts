/**
 * One call per funnel step from the app's hooks: sends the analytics event with
 * the page locale and, for starts and completions, bumps the anonymous
 * per-partner counter with the partner code (which never goes to analytics).
 * Never throws.
 */
import { loadAttribution } from "./attribution";
import { trackFunnel, type FunnelEvent, type FunnelProps } from "./analytics";
import type { CountedEvent } from "./validation";

const COUNTED: Partial<Record<FunnelEvent, CountedEvent>> = { start: "start", completion: "complete" };

export function funnel(event: FunnelEvent, extra: Pick<FunnelProps, "target"> = {}): void {
  if (typeof document === "undefined") return;
  const ref = loadAttribution()?.ref;
  trackFunnel(event, { locale: document.documentElement.lang, ...extra });
  const counted = COUNTED[event];
  if (counted) {
    try {
      // keepalive: the start form navigates away immediately.
      void fetch("/api/marketing/funnel", { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ event: counted, ...(ref ? { ref } : {}) }) }).catch(() => {});
    } catch { /* counting must never break the page */ }
  }
}
