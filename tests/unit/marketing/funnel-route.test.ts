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

  it("rate limits each client to 60 counts of each event an hour, so a group on one network is still counted", async () => {
    const statuses = [];
    for (let i = 0; i < 61; i++) statuses.push((await POST(req({ event: "start" }, "10.9.9.9"))).status);
    expect(statuses.slice(0, 60).every((s) => s === 204)).toBe(true);
    expect(statuses[60]).toBe(429);
    expect((await POST(req({ event: "complete" }, "10.9.9.9"))).status).toBe(204);
  });

  it("caps any client at 300 requests an hour, valid or not", async () => {
    const statuses = [];
    for (let i = 0; i < 301; i++) statuses.push((await POST(req("not json", "10.8.8.8"))).status);
    expect(statuses.slice(0, 300).every((s) => s === 400)).toBe(true);
    expect(statuses[300]).toBe(429);
  });
});
