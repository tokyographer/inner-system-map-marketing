import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Forbidden() {
  const t = await getTranslations("dashboard");
  return (
    <div className="space-y-4 py-10">
      <p>{t("forbidden")}</p>
      <Link href="/cohort/join" className="btn btn-outline no-underline">{t("backToCohort")}</Link>
    </div>
  );
}
