"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteAccount, signOut } from "@/lib/actions/cohort";
import { useRouter } from "@/i18n/navigation";

export function SettingsPanel() {
  const t = useTranslations("cohort");
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function del() {
    setStatus("busy");
    const r = await deleteAccount(confirm);
    if (r.ok) { setStatus("done"); router.push("/"); return; }
    setStatus("error");
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="export" className="card space-y-3 p-5">
        <h2 id="export" className="text-xl">{t("exportTitle")}</h2>
        <a href="/api/cohort/export" className="btn btn-outline no-underline" download>{t("exportJson")}</a>
      </section>
      <section aria-labelledby="delete" className="card card-warm space-y-3 p-5">
        <h2 id="delete" className="text-xl">{t("deleteTitle")}</h2>
        <p className="text-sm">{t("deleteLead")}</p>
        <label className="block text-sm">{t("deleteConfirm")}
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2" />
        </label>
        <button type="button" onClick={del} disabled={confirm !== "DELETE" || status === "busy"} className="btn btn-primary">{t("deleteButton")}</button>
        {status === "error" && <p role="alert" className="text-sm text-interactive">{t("unavailable")}</p>}
      </section>
      <button type="button" onClick={async () => { await signOut(); router.push("/"); }} className="btn btn-outline">{t("signOut")}</button>
    </div>
  );
}
