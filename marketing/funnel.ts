/**
 * One call per funnel step from the app's hooks: adds the page locale and the
 * partner code from the attribution, then sends the analytics event. Never throws.
 */
import { loadAttribution } from "./attribution";
import { trackFunnel, type FunnelEvent, type FunnelProps } from "./analytics";

export function funnel(event: FunnelEvent, extra: Pick<FunnelProps, "target"> = {}): void {
  if (typeof document === "undefined") return;
  const ref = loadAttribution()?.ref;
  trackFunnel(event, { locale: document.documentElement.lang, ...(ref ? { ref } : {}), ...extra });
}
