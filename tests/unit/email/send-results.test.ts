import { describe, expect, it, vi } from "vitest";
import type { Resend } from "resend";
import { readEmailEnv, sendResultsEmail } from "@/lib/email/send-results";

function fakeResend(fail?: "first" | "second") {
  const send = vi.fn()
    .mockResolvedValueOnce(fail === "first" ? { data: null, error: { message: "boom" } } : { data: { id: "u1" }, error: null })
    .mockResolvedValueOnce(fail === "second" ? { data: null, error: { message: "boom" } } : { data: { id: "c1" }, error: null });
  return { client: { emails: { send } } as unknown as Resend, send };
}

const base = { to: "person@example.com", locale: "en" as const, pdf: Buffer.from("%PDF-fake"), patternTitle: "Managers are leading", flooded: false };
const env = { apiKey: "k", from: "Map <results@example.com>", copyTo: "info@transcendentinstitute.com" };

describe("readEmailEnv", () => {
  it("throws an actionable error when unset", () => {
    expect(() => readEmailEnv({} as NodeJS.ProcessEnv)).toThrow(/RESEND_API_KEY/);
  });
  it("treats empty RESULTS_COPY_TO as disabled", () => {
    expect(readEmailEnv({ RESEND_API_KEY: "k", RESEND_FROM: "f", RESULTS_COPY_TO: "  " } as unknown as NodeJS.ProcessEnv).copyTo).toBeNull();
  });
});

describe("sendResultsEmail", () => {
  it("sends to the person and a separate copy to the institute with the PDF attached", async () => {
    const { client, send } = fakeResend();
    const ids = await sendResultsEmail(base, env, client);
    expect(ids).toEqual({ userId: "u1", copyId: "c1" });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].to).toEqual(["person@example.com"]);
    expect(send.mock.calls[1][0].to).toEqual(["info@transcendentinstitute.com"]);
    for (const call of send.mock.calls) {
      expect(call[0].attachments[0].filename).toMatch(/\.pdf$/);
      expect(call[0].attachments[0].content).toBe(base.pdf);
      expect(call[0].bcc).toBeUndefined();
    }
  });
  it("skips the institute copy when RESULTS_COPY_TO is empty", async () => {
    const { client, send } = fakeResend();
    const ids = await sendResultsEmail(base, { ...env, copyTo: null }, client);
    expect(ids.copyId).toBeNull();
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("flags FLOODED in the institute copy only", async () => {
    const { client, send } = fakeResend();
    await sendResultsEmail({ ...base, flooded: true }, env, client);
    expect(send.mock.calls[0][0].text).not.toContain("FLOODED");
    expect(send.mock.calls[1][0].text).toContain("FLOODED");
  });
  it("surfaces provider errors", async () => {
    await expect(sendResultsEmail(base, env, fakeResend("first").client)).rejects.toThrow(/participant failed/);
    await expect(sendResultsEmail(base, env, fakeResend("second").client)).rejects.toThrow(/institute failed/);
  });
});
