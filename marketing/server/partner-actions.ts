"use server";
import { currentUser } from "@/lib/auth/server";
import { withUser } from "@/lib/db";
import { roleOf } from "@/lib/dashboard/queries";
import { partnerCodeSchema, registerPartnerSchema } from "../validation";

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
    await withUser(user.id, (db) => db.query("insert into public.marketing_partners (code, label, created_by) values ($1, $2, $3)", [parsed.data.code, parsed.data.label, user.id]));
    return { ok: true, code: parsed.data.code };
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return { ok: false, error: "duplicate" };
    console.error("registerPartner failed", { reason: reason(err) });
    return { ok: false, error: "failed" };
  }
}

/** Removes a partner and its label (which may name a person). Later visits with the code count as unregistered. */
export async function removePartner(input: unknown): Promise<PartnerResult> {
  const parsed = partnerCodeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const user = await admin();
  if ("ok" in user) return user;
  try {
    await withUser(user.id, (db) => db.query("delete from public.marketing_partners where code = $1", [parsed.data.code]));
    return { ok: true, code: parsed.data.code };
  } catch (err) {
    console.error("removePartner failed", { reason: reason(err) });
    return { ok: false, error: "failed" };
  }
}
