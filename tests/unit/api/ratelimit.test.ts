import { afterEach, describe, expect, it, vi } from "vitest";
import { _memoryLimit as rateLimit, clientKey, sharedLimiterConfigured } from "@/lib/ratelimit";

describe("rateLimit", () => {
  it("allows up to the limit in the window, then blocks with retry-after", () => {
    const t0 = 1_000_000;
    expect(rateLimit("k", 2, 1000, t0).ok).toBe(true);
    expect(rateLimit("k", 2, 1000, t0 + 10).ok).toBe(true);
    const blocked = rateLimit("k", 2, 1000, t0 + 20);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    expect(rateLimit("k", 2, 1000, t0 + 1001).ok).toBe(true);
  });
});

describe("clientKey", () => {
  const req = (h: Record<string, string>) => new Request("https://x.test", { headers: h });
  it("prefers the platform headers and otherwise the last forwarded entry, which the proxy added", () => {
    expect(clientKey(req({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("9.9.9.9");
    expect(clientKey(req({ "x-vercel-forwarded-for": "8.8.8.8", "x-forwarded-for": "1.1.1.1" }))).toBe("8.8.8.8");
    expect(clientKey(req({ "x-forwarded-for": "spoofed, 2.2.2.2" }))).toBe("2.2.2.2");
    expect(clientKey(req({}))).toBe("anonymous");
  });
});

describe("sharedLimiterConfigured", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("needs both Upstash variables", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", ""); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    expect(sharedLimiterConfigured()).toBe(false);
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://r.test"); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "t");
    expect(sharedLimiterConfigured()).toBe(true);
  });
});
