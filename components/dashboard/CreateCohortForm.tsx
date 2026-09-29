"use client";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { LOCALES } from "@/config/app";
import { createCohort } from "@/lib/actions/admin";
import { useRouter } from "@/i18n/navigation";

export function CreateCohortForm() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ code: string } | null>(null);
  const input = "mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(null);
    const f = new FormData(e.currentTarget);
    const r = await createCohort(Object.fromEntries(f.entries()));
    setBusy(false);
    if (r.ok && r.data) { setCreated({ code: r.data.code }); router.refresh(); return; }
    setError(r.ok ? null : r.error === "invalid_input" ? t("invalidInput") : t("failed"));
  }

  if (created) return <div className="card card-warm space-y-2 p-5"><p>{t("created")}</p><p className="font-mono text-2xl tracking-widest">{created.code}</p></div>;
  return (
    <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2" noValidate>
      <label className="block text-sm sm:col-span-2">{t("name")}<input name="name" required className={input} /></label>
      <label className="block text-sm">{t("level")}<input name="level" defaultValue="II" required className={input} /></label>
      <label className="block text-sm">{t("language")}<select name="language" defaultValue="en" className={input}>{LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}</select></label>
      <label className="block text-sm">{t("startsOn")}<input name="startsOn" type="date" className={input} /></label>
      <label className="block text-sm">{t("endsOn")}<input name="endsOn" type="date" className={input} /></label>
      <label className="block text-sm">{t("codeExpires")}<input name="codeExpiresOn" type="date" required className={input} /></label>
      <label className="block text-sm">{t("retention")}<input name="retentionMonths" type="number" min={1} max={60} defaultValue={12} className={input} /></label>
      {error && <p role="alert" className="text-sm text-interactive sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2"><button type="submit" disabled={busy} className="btn btn-primary">{t("create")}</button></div>
    </form>
  );
}
