"use client";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { requestMagicLink } from "@/lib/actions/cohort";

export function JoinForm({ initialError }: { initialError?: string }) {
  const t = useTranslations("cohort");
  const locale = useLocale();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | string>(initialError ? "invalidCode" : "idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("busy");
    const r = await requestMagicLink({ code, email, locale });
    if (r.ok) { setStatus("sent"); return; }
    setStatus({ invalid_input: "invalidInput", invalid_code: "invalidCode", rate_limited: "rateLimited" }[r.error as string] ?? "unavailable");
  }

  if (status === "sent") return <p role="status" className="card card-warm p-5">{t("linkSent")}</p>;
  const errorKey = ["invalidInput", "invalidCode", "rateLimited", "unavailable"].includes(status) ? status : null;
  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-5">
      <label className="block text-sm">{t("code")}
        <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" autoCapitalize="characters" className="mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2 font-mono tracking-widest" required />
      </label>
      <label className="block text-sm">{t("email")}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1 min-h-[44px] w-full rounded-[2px] border border-line bg-paper px-3 py-2" required />
      </label>
      {errorKey && <p role="alert" className="text-sm text-interactive">{t(errorKey)}</p>}
      <button type="submit" disabled={status === "busy"} className="btn btn-primary">{t("sendLink")}</button>
    </form>
  );
}
