# Upstream core requests

Core changes the marketing features need. Each one is made in `../inner-system-ifs-test` (the source of truth for the core) and ported here with the `core-sync` agent. Remove an entry here once it has been ported.

Requests 1 (`instituteDetails`) and 2 (`personFooter`) were made upstream in `inner-system-ifs-test@f2021d9`, ported here as `f14acf5` and wired in `marketing/email.ts`.

## 3. Do not log Resend's error text
- **Why:** found by data-privacy-auditor. `lib/email/send-results.ts` wraps Resend's `error.message` in the thrown error ("Copy to institute failed: …" and the person's send), and `app/api/public/email-results/route.ts` logs `err.message` as `reason`. If Resend's message ever echoes the recipient address, an email lands in the logs, which breaks "never log emails".
- **Files:** `lib/email/send-results.ts`, `tests/unit/email/send-results.test.ts`.
- **Behaviour:** throw errors with a fixed message plus Resend's error `name` or code only (for example `Results email failed (validation_error)`), never Resend's `message`. Keep the existing distinction between the person's send and the institute copy.
- **Tests:** a mocked Resend error whose `message` contains `person@example.test` produces a thrown error whose message does not contain it and does contain the error name.
- **Marketing follow-up after the port:** none (the route already logs `err.message` only).

## Not core: assessed and left to the marketing repo
The brief listed these as core work; on inspection they need no core change, so they are not requests here. They were postponed as instructed and wait for your go-ahead.
- **Nurture-consent checkbox.** The checkbox can live in `components/questionnaire/StartScreen.tsx` (not core) with its label under the `"marketing"` messages key, kept in its own browser key (not the core `Contact`), sent as a marketing field parsed by `marketing/validation.ts`, and stored in a marketing table (`m0003`) with the policy version. Its wording waits for the lawyer.
- **Opt-in sync to the email tool.** Sending `{ email, locale, source }` (double opt-in) happens in the email route (not core). The consent record belongs in the marketing table above, not on `public_results`, because the core retention job deletes public results after 6 months while the contact would still be in the email tool. Deletion: `app/api/public/delete-result/route.ts` and `lib/public-results/store.ts` are not core, so the delete link can also remove the contact (look up the email before deleting the row), plus an unsubscribe link in every nurture email.
