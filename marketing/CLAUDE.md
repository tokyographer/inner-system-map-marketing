# marketing: lead-generation features (this repo only)

Everything in this folder exists only in the marketing repo. Nothing here is core, and nothing here is ever ported upstream. The plan behind it is https://claude.ai/artifact/TE43jqJa9kYRe37fMBsANn.

## Guardrails (from the plan; they bind code, copy, ads and emails)
- **No results-based audiences.** Never send results, patterns, scores, item responses or care flags to an ad platform, analytics tool or email tool, and never build an audience, segment or list from them. Analytics events and synced contacts carry no result data.
- **No promotional email for FLOODED results.** A person whose pattern is FLOODED gets no promotional message: no program invite, no live-session invite, no nurture sequence. The results page already hides `ProgramInvite` for them; every new marketing surface (web or email) must check the pattern the same way.
- **Separate marketing consent.** Nurture emails need their own checkbox on the start screen, separate from the results consent and the newsletter. Its wording is **DRAFT pending a lawyer**: ship nothing that sends nurture email until the lawyer approves it. It is logged with the policy version, like the newsletter consent. (Not built yet: it touches core paths, see the upstream requests in `docs/AGENT-CHANGELOG.md`.)
- **Opt-in sync sends only email, locale and source.** When opt-ins are synced to an email tool, the payload is exactly `{ email, locale, source }` (source = utm/ref attribution). Never name, never scores. Deleting through the existing delete link must remove the contact there too. (Not built yet: core paths.)
- **Partner links use `?ref=CODE`.** A partner shares `/{locale}?ref=CODE`. Codes are lowercase letters, digits and hyphens, 2–32 characters (`REF_CODE` in `validation.ts`). Counts per code are aggregates only.
- Also from the plan: never market to anyone under 18 or remove the age gate; never make results shareable (sharing shares the landing URL only); never treat the institute copy as a sales list; never describe the map as validated, clinical, diagnostic or a cure, in any language; never use testimonials without written consent.

## Rules for code here
- Marketing request fields (utm_*, ref, marketing consent) are parsed by `validation.ts` inside the routes, next to the core schema. Never extend `lib/validation/`. Invalid marketing fields are dropped; they never fail the core request.
- Marketing UI strings live under the top-level `"marketing"` key in `messages/{en,es,ro,tr}.json`, in all four locales (ES/RO/TR are drafts). The locales test checks key parity and forbidden words for them too.
- Marketing tables and columns come from `db/migrations/m0NNN_*.sql`. They may add columns to core tables but never change core columns, constraints or functions.
- Browser storage is wrapped in try/catch; a blocked storage never breaks the page.
- Never log attribution together with an email, name or result. Log the outcome and reason only.
