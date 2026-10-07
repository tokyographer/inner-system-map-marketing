# Upstream core requests

Core changes the marketing features need. Each one is made in `../inner-system-ifs-test` (the source of truth for the core) and ported here with the `core-sync` agent. Remove an entry here once it has been ported.

Requests 1 to 3 are done. Requests 1 (`instituteDetails`) and 2 (`personFooter`) were made upstream in `inner-system-ifs-test@f2021d9`, ported here as `f14acf5` and wired in `marketing/email.ts`. Request 3 (do not log Resend's error text) was made upstream in `inner-system-ifs-test@6b1ba87` and ported here in this commit; it needed no marketing follow-up.

## Not core: assessed and left to the marketing repo
The brief listed these as core work; on inspection they need no core change, so they are not requests here. They were postponed as instructed and wait for your go-ahead.
- **Nurture-consent checkbox.** The checkbox can live in `components/questionnaire/StartScreen.tsx` (not core) with its label under the `"marketing"` messages key, kept in its own browser key (not the core `Contact`), sent as a marketing field parsed by `marketing/validation.ts`, and stored in a marketing table (`m0003`) with the policy version. Its wording waits for the lawyer.
- **Opt-in sync to the email tool.** Sending `{ email, locale, source }` (double opt-in) happens in the email route (not core). The consent record belongs in the marketing table above, not on `public_results`, because the core retention job deletes public results after 6 months while the contact would still be in the email tool. Deletion: `app/api/public/delete-result/route.ts` and `lib/public-results/store.ts` are not core, so the delete link can also remove the contact (look up the email before deleting the row), plus an unsubscribe link in every nurture email.
