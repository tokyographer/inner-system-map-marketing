"use client";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CONSENT_POLICY_VERSION } from "@/config/app";
import { Link, useRouter } from "@/i18n/navigation";
import { recordConsentAndJoin } from "@/lib/actions/cohort";

export function ConsentForm({ code, cohortName }: { code: string; cohortName: string }) {
  const t = useTranslations("cohort");
  const locale = useLocale();
  const router = useRouter();
  const [store, setStore] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!store) { setError(t("consentRequired")); return; }
    setBusy(true);
    const r = await recordConsentAndJoin({ code, storeAndShare: true, newsletter, policyVersion: CONSENT_POLICY_VERSION, locale });
    if (r.ok) { router.push("/cohort"); return; }
    setBusy(false);
    setError(r.error === "invalid_code" ? t("invalidCode") : t("unavailable"));
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-5">
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={store} onChange={(e) => { setStore(e.target.checked); setError(null); }} className="mt-1 h-5 w-5" /><span>{t("consentStore", { cohort: cohortName })}</span></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-1 h-5 w-5" /><span>{t("consentNewsletter")}</span></label>
      <p className="text-xs"><Link href="/privacy">{t("consentPolicy")}</Link></p>
      {error && <p role="alert" className="text-sm text-interactive">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary">{t("continue")}</button>
    </form>
  );
}
