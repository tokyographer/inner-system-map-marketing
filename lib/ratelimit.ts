/**
 * Rate limiting. Uses Upstash Redis (sliding window, shared across all
 * function instances) when UPSTASH_REDIS_REST_URL is set; otherwise an
 * in-memory window, which is per instance and therefore only a soft limit.
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
  return { ok: true, retryAfterSeconds: 0 };
}

function redisLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const id = `${limit}:${windowMs}`;
  let l = limiters.get(id);
  if (!l) {
    l = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`), prefix: "ism" });
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

export function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || request.headers.get("x-real-ip") || "anonymous";
}
