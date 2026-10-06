"use client";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { registerPartner } from "../server/partner-actions";

/** Admin: registers a partner code; its links then appear in the table. */
export function RegisterPartnerForm() {
  const t = useTranslations("marketing.partners");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const input = "mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage(null);
    const form = e.currentTarget;
    const r = await registerPartner(Object.fromEntries(new FormData(form).entries()));
    setBusy(false);
    if (r.ok) { form.reset(); setMessage({ kind: "ok", text: t("registered", { code: r.code }) }); router.refresh(); return; }
    setMessage({ kind: "error", text: r.error === "invalid_input" ? t("builderInvalid") : r.error === "duplicate" ? t("duplicate") : t("failed") });
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2" noValidate>
      <label className="block text-sm">{t("builderCode")}
        <input name="code" required autoComplete="off" spellCheck={false} aria-describedby="partner-code-help" className={input} />
      </label>
      <label className="block text-sm">{t("label")}
        <input name="label" required maxLength={120} className={input} />
      </label>
      <p id="partner-code-help" className="text-xs text-ink-muted sm:col-span-2">{t("builderHelp")}</p>
      {message && <p role={message.kind === "error" ? "alert" : "status"} className="text-sm sm:col-span-2">{message.text}</p>}
      <div className="sm:col-span-2"><button type="submit" disabled={busy} className="btn btn-primary">{t("register")}</button></div>
    </form>
  );
}
