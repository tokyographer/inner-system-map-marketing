# Upstream core requests

Core changes the marketing features need. Each one is made in `../inner-system-ifs-test` (the source of truth for the core) and ported here with the `core-sync` agent. Remove an entry here once it has been ported.

## 1. Extra lines in the institute copy (for source attribution)
- **Why:** marketing wants the institute copy of the results email to show where the person came from (utm_source, utm_medium, utm_campaign, partner ref). The institute copy is built in `lib/email/send-results.ts`, which is core.
- **Files:** `lib/email/send-results.ts`, `tests/unit/email/send-results.test.ts`.
- **Behaviour:** add an optional, repo-neutral field to `SendResultsArgs`: `instituteDetails?: { label: string; value: string }[]`. When present, each entry is appended to the institute copy's text body as `Label: value`, after the `Pattern:` line (and after the FLOODED note). It is never added to the person's email. Labels and values are single-line: strip `\r` and `\n` and trim; drop entries whose label or value is empty after that; cap each at 120 characters. Upstream callers pass nothing, so upstream output is unchanged. The field must stay English-only like the rest of the copy (the caller is responsible; document it in the JSDoc).
- **Tests:** (a) with `instituteDetails: [{ label: "Source", value: "newsletter" }, { label: "Partner", value: "studio-om" }]` the institute text contains `Source: newsletter` and `Partner: studio-om` and the person's text contains neither; (b) a value with `\n` comes out on one line; (c) empty entries are dropped; (d) without the field the institute text is byte-identical to today's.
- **Marketing follow-up after the port:** the email route passes `instituteDetails` built from `attribution` (labels "Source", "Medium", "Campaign", "Partner").
