import { describe, expect, it } from "vitest";
import { _memoryLimit as rateLimit } from "@/lib/ratelimit";

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
