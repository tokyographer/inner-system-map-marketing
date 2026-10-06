import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const increment = vi.fn();
let dbOn = true;
vi.mock("@/lib/db", () => ({ dbConfigured: () => dbOn }));
vi.mock("@/marketing/server/funnel-counts", () => ({ incrementFunnel: (...a: unknown[]) => increment(...a) }));

const { POST } = await import("@/app/api/marketing/funnel/route");

let ip = 0;
const req = (body: unknown, client = `10.0.0.${++ip}`) =>
  new Request("http://x.test/api/marketing/funnel", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": client }, body: typeof body === "string" ? body : JSON.stringify(body) });

beforeEach(() => { dbOn = true; increment.mockReset(); vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); });

describe("POST /api/marketing/funnel", () => {
  it("counts a start or completion, with or without a partner code", async () => {
    expect((await POST(req({ event: "start", ref: "studio-om" }))).status).toBe(204);
    expect((await POST(req({ event: "complete" }))).status).toBe(204);
    expect(increment.mock.calls).toEqual([["start", "studio-om"], ["complete", undefined]]);
  });

  it("rejects anything else and stores nothing", async () => {
    for (const body of [{ event: "email_sent" }, { event: "start", ref: "Bad Code" }, "not json"]) {
      expect((await POST(req(body))).status).toBe(400);
    }
    expect(increment).not.toHaveBeenCalled();
  });

  it("does nothing without a database and reports a failed write by reason only", async () => {
    dbOn = false;
    expect((await POST(req({ event: "start" }))).status).toBe(204);
    expect(increment).not.toHaveBeenCalled();
    dbOn = true;
    increment.mockRejectedValueOnce(new Error("connection lost"));
    expect((await POST(req({ event: "start" }))).status).toBe(502);
    expect(console.error).toHaveBeenCalledWith("funnel count failed", { reason: "connection lost" });
  });

  it("rate limits each client to 10 counts an hour", async () => {
    const statuses = [];
    for (let i = 0; i < 11; i++) statuses.push((await POST(req({ event: "start" }, "10.9.9.9"))).status);
    expect(statuses.slice(0, 10).every((s) => s === 204)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});
