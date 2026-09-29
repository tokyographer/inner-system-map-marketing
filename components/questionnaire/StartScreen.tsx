"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CONSENT_POLICY_VERSION, DEFAULT_FORM, type Form } from "@/config/app";
import { useRouter } from "@/i18n/navigation";
import { newSeed } from "@/lib/questionnaire/order";
import { clearProgress, saveContact, saveProgress, useProgress } from "@/lib/questionnaire/storage";

interface Props {
  form?: Form;
  questionnairePath?: string;
  /** Public mode asks for name and email up front; cohort mode already knows the person. */
  collectContact?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StartScreen({ form = DEFAULT_FORM.public, questionnairePath = "/questionnaire", collectContact = false }: Props = {}) {
  const t = useTranslations("start");
  const tl = useTranslations("likert");
  const router = useRouter();
  const existing = useProgress();
  const [age, setAge] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function begin() {
    if (collectContact && (!name.trim() || !EMAIL.test(email) || !consent)) { setError(t("contactRequired")); return; }
    if (!age) { setError(t("ageRequired")); return; }
    if (collectContact) saveContact({ name: name.trim(), email: email.trim(), newsletter, policyVersion: CONSENT_POLICY_VERSION });
    clearProgress();
    saveProgress({ seed: newSeed(), form, startedAt: Date.now(), index: 0, responses: {} });
    router.push(questionnairePath);
  }

  const input = "mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2 focus:border-interactive";

  return (
    <div className="space-y-8 py-10">
      <h1 className="text-[34px] sm:text-4xl">{t("title")}</h1>
      <p className="text-lg">{t("instruction")}</p>
      <section className="card card-warm p-5">
        <h2 className="label mb-3">{t("scaleTitle")}</h2>
        <ol className="grid gap-1 text-sm sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((v) => <li key={v}><span className="text-ink-muted">{v}</span> {tl(String(v))}</li>)}
        </ol>
      </section>
      <p className="text-sm text-ink-muted">{t("browser")}</p>

      {existing && Object.keys(existing.responses).length > 0 ? (
        <div className="card space-y-4 p-5">
          <p>{t("resume")}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push(questionnairePath)} className="btn btn-primary">{t("continue")}</button>
            <button type="button" onClick={() => clearProgress()} className="btn btn-outline">{t("startOver")}</button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); begin(); }} className="space-y-5" noValidate>
          {collectContact && (
            <section aria-labelledby="contact" className="card space-y-4 p-5">
              <h2 id="contact" className="text-xl">{t("contactTitle")}</h2>
              <label className="block text-sm">{t("name")}
                <input value={name} onChange={(e) => { setName(e.target.value); setError(null); }} autoComplete="name" className={input} required />
              </label>
              <label className="block text-sm">{t("email")}
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} autoComplete="email" className={input} required />
              </label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(null); }} className="mt-1 h-5 w-5" required /><span>{t("contactConsent")}</span></label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-1 h-5 w-5" /><span>{t("newsletter")}</span></label>
              <p className="text-xs text-ink-muted">{t("onScreen")}</p>
            </section>
          )}
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={age} onChange={(e) => { setAge(e.target.checked); setError(null); }} className="mt-1 h-5 w-5" aria-describedby={error ? "start-error" : undefined} />
            <span>{t("age")}</span>
          </label>
          {error && <p id="start-error" role="alert" className="text-sm text-interactive">{error}</p>}
          <button type="submit" className="btn btn-primary">{t("start")}</button>
        </form>
      )}
    </div>
  );
}
