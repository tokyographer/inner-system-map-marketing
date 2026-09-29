"use client";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { assignFacilitator } from "@/lib/actions/admin";
import { useRouter } from "@/i18n/navigation";

export function AssignFacilitatorForm({ cohortId }: { cohortId: string }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "notFound" | "error">("idle");

  async function submit(e: FormEvent) {
    e.preventDefault(); setStatus("busy");
    const r = await assignFacilitator({ cohortId, email });
    if (r.ok) { setStatus("done"); setEmail(""); router.refresh(); return; }
    setStatus(r.error === "user_not_found" ? "notFound" : "error");
  }
  return (
    <form onSubmit={submit} noValidate className="card space-y-3 p-5">
      <h3 className="text-lg">{t("assignFacilitator")}</h3>
      <label className="block text-sm">{t("facilitatorEmail")}<input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }} className="mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2" /></label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "busy"} className="btn btn-outline">{t("assign")}</button>
        {status === "done" && <span role="status" className="text-sm">{t("assigned")}</span>}
        {status === "notFound" && <span role="alert" className="text-sm text-interactive">{t("userNotFound")}</span>}
        {status === "error" && <span role="alert" className="text-sm text-interactive">{t("failed")}</span>}
      </div>
    </form>
  );
}
