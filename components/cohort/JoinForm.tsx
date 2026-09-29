"use client";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { requestSignInCode, verifySignInCode } from "@/lib/actions/cohort";

type ErrorKey = "invalidInput" | "invalidCode" | "invalidOtp" | "rateLimited" | "unavailable";
const MAP: Record<string, ErrorKey> = { invalid_input: "invalidInput", invalid_code: "invalidCode", invalid_otp: "invalidOtp", rate_limited: "rateLimited" };

export function JoinForm({ initialError }: { initialError?: string }) {
  const t = useTranslations("cohort");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(initialError ? "invalidCode" : null);

  async function request(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    const r = await requestSignInCode({ code, email, locale });
    setBusy(false);
    if (r.ok) { setStep("verify"); return; }
    setError(MAP[r.error] ?? "unavailable");
  }

  async function verify(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    const r = await verifySignInCode({ email, otp, locale });
    if (r.ok) { router.push("/cohort/consent"); return; }
    setBusy(false);
    setError(MAP[r.error] ?? "unavailable");
  }

  const input = "mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2";

  if (step === "verify") {
    return (
      <form onSubmit={verify} noValidate className="card space-y-4 p-5">
        <p role="status">{t("codeSent")}</p>
        <label className="block text-sm">{t("otp")}
          <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className={`${input} font-mono tracking-[0.3em]`} required />
        </label>
        {error && <p role="alert" className="text-sm text-interactive">{t(error)}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary">{t("verify")}</button>
      </form>
    );
  }
  return (
    <form onSubmit={request} noValidate className="card space-y-4 p-5">
      <label className="block text-sm">{t("code")}
        <input value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" className={`${input} font-mono tracking-widest`} required />
      </label>
      <label className="block text-sm">{t("email")}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} required />
      </label>
      {error && <p role="alert" className="text-sm text-interactive">{t(error)}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary">{t("sendCode")}</button>
    </form>
  );
}
