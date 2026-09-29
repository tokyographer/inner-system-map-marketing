import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** Locale routing only. Cohort pages check the Neon Auth session themselves. */
export default createIntlMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|auth|.*\\..*).*)"],
};
