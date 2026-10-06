"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { removePartner } from "../server/partner-actions";

export function RemovePartnerButton({ code }: { code: string }) {
  const t = useTranslations("marketing.partners");
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  async function remove() {
    if (!window.confirm(t("removeConfirm", { code }))) return;
    const r = await removePartner({ code });
    if (r.ok) router.refresh(); else setFailed(true);
  }

  return (
    <>
      <button type="button" onClick={remove} className="label underline">{t("remove")}<span className="sr-only"> {code}</span></button>
      {failed && <span role="alert" className="ml-2 text-sm">{t("failed")}</span>}
    </>
  );
}
