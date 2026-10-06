"use server";
import { currentUser } from "@/lib/auth/server";
import { roleOf } from "@/lib/dashboard/queries";
import { partnerCodeSchema, registerPartnerSchema } from "../validation";
import { deletePartner, insertPartner } from "./funnel-counts";

type Failure = { ok: false; error: "invalid_input" | "not_signed_in" | "forbidden" | "duplicate" | "failed" };
export type PartnerResult = { ok: true; code: string } | Failure;

function reason(err: unknown): string { return err instanceof Error ? err.message : "unknown"; }

/** Signed-in admin, or the failure to return. RLS enforces the same rule in the database. */
async function admin(): Promise<{ id: string } | Failure> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  return (await roleOf(user.id)) === "admin" ? user : { ok: false, error: "forbidden" };
}

/** Registers a partner code so its starts and completions get their own row. */
export async function registerPartner(input: unknown): Promise<PartnerResult> {
  const parsed = registerPartnerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await admin();
  if ("ok" in user) return user;
  try {
    await insertPartner(user.id, parsed.data.code, parsed.data.label);
    return { ok: true, code: parsed.data.code };
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return { ok: false, error: "duplicate" };
    console.error("registerPartner failed", { reason: reason(err) });
    return { ok: false, error: "failed" };
  }
}

/** Removes a partner and its label, folding its past counts into the unregistered row (see deletePartner). */
export async function removePartner(input: unknown): Promise<PartnerResult> {
  const parsed = partnerCodeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await admin();
  if ("ok" in user) return user;
  try {
    await deletePartner(user.id, parsed.data.code);
    return { ok: true, code: parsed.data.code };
  } catch (err) {
    console.error("removePartner failed", { reason: reason(err) });
    return { ok: false, error: "failed" };
  }
}
