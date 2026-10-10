/**
 * Rate limiting. Uses Upstash Redis (sliding window, shared across all
 * function instances) when its REST URL and token are set, under either the
 * UPSTASH_REDIS_REST_* names or the KV_REST_API_* names the Vercel Marketplace
 * integration creates; otherwise an in-memory window, which is per instance
 * and therefore only a soft limit.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface LimitResult { ok: boolean; retryAfterSeconds: number }

const buckets = new Map<string, number[]>();
const limiters = new Map<string, Ratelimit>();

function memoryLimit(key: string, limit: number, windowMs: number, now = Date.now()): LimitResult {
  const since = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > since);
  if (hits.length >= limit) return { ok: false, retryAfterSeconds: Math.ceil((hits[0] + windowMs - now) / 1000) };
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) for (const [k, v] of buckets) if (!v.some((t) => t > since)) buckets.delete(k);
  return { ok: true, retryAfterSeconds: 0 };
}

/** True when limits are shared across instances (Upstash). Sends that cost money or reputation need this. */
export function sharedLimiterConfigured(): boolean {
  return redisConfig() !== null;
}

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function redisLimiter(limit: number, windowMs: number): Ratelimit | null {
  const config = redisConfig();
  if (!config) return null;
  const id = `${limit}:${windowMs}`;
  let l = limiters.get(id);
  if (!l) {
    l = new Ratelimit({ redis: new Redis(config), limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`), prefix: "ism" });
    limiters.set(id, l);
  }
  return l;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  const l = redisLimiter(limit, windowMs);
  if (!l) return memoryLimit(key, limit, windowMs);
  try {
    const r = await l.limit(key);
    return { ok: r.success, retryAfterSeconds: r.success ? 0 : Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
  } catch (err) {
    console.error("rate limit backend unavailable, falling back to memory", { reason: err instanceof Error ? err.message : "unknown" });
    return memoryLimit(key, limit, windowMs);
  }
}

/** Exposed for unit tests of the in-memory window. */
export const _memoryLimit = memoryLimit;

/** Vercel sets x-real-ip and x-vercel-forwarded-for itself; behind any other proxy the last x-forwarded-for entry is the one the proxy added. */
export function clientKey(request: Request): string {
  const h = request.headers;
  const fwd = h.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean).at(-1);
  return h.get("x-real-ip") || h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || fwd || "anonymous";
}
