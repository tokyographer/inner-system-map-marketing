"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { saveNote } from "@/lib/actions/cohort";
import type { ProtectorKey } from "@/lib/scoring/types";

export function NoteEditor({ attemptId, protectorKey, initialBody, initialShared }: { attemptId: string; protectorKey: ProtectorKey; initialBody: string; initialShared: boolean }) {
  const t = useTranslations("cohort");
  const [body, setBody] = useState(initialBody);
  const [shared, setShared] = useState(initialShared);
  const [status, setStatus] = useState<"idle" | "busy" | "saved" | "error">("idle");

  async function save() {
    setStatus("busy");
    const r = await saveNote({ attemptId, protectorKey, body, shareWithFacilitator: shared });
    setStatus(r.ok ? "saved" : "error");
  }

  return (
    <section aria-labelledby="note" className="card space-y-3 p-5">
      <h2 id="note" className="text-xl">{t("noteTitle")}</h2>
      <textarea id="note-body" aria-labelledby="note" value={body} onChange={(e) => { setBody(e.target.value); setStatus("idle"); }} maxLength={4000} rows={5} className="w-full rounded-[2px] border border-line bg-paper px-3 py-2" />
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={shared} onChange={(e) => { setShared(e.target.checked); setStatus("idle"); }} className="mt-1 h-5 w-5" /><span>{t("noteShare")}</span></label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={status === "busy"} className="btn btn-outline">{t("noteSave")}</button>
        {status === "saved" && <span role="status" className="text-sm text-ink-muted">{t("noteSaved")}</span>}
        {status === "error" && <span role="alert" className="text-sm text-interactive">{t("saveError")}</span>}
      </div>
    </section>
  );
}
