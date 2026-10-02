# lib/scoring: the scoring engine

`score(input) → Result` is pure: no I/O, no `Date`, no randomness, no copy strings. Both the browser (public mode) and the server (`lib/actions/cohort.ts`, the PDF/email routes) call it, so it must stay isomorphic.

## Files
- `scales.ts`: item completeness check (`assertComplete`), scale means, display values and bands.
- `groups.ts`: group leads (manager, firefighter, exile) and protection load.
- `pattern.ts`: one of six pattern keys plus modifiers. Rules are evaluated in order, first match wins. A manager/firefighter gap of exactly `groupLeadGap` (0.3) is not POLARISED.
- `ranking.ts`: protector and exile ranking, the leading protector, or a team (top two, plus the third when within `teamThirdGap` of the second).
- `pairings.ts`: protector to exile pairings from `content/pairings.ts`.
- `flags.ts`: quality flags (straight-lining, too fast, acquiescence) and the care flag.
- `types.ts`: scale keys and the `Result` shape. Adding a key changes the content `Record`s in every locale.

## Rules
- Every number comes from `config/scoring.ts`. No inline thresholds.
- Compare means with the epsilon helpers (`gte`/`lt` in `pattern.ts`), not with raw `>=`, because means of 1–5 integers hit thresholds exactly.
- Any change to a rule or threshold bumps `SCORING_VERSION`. Attempts store the version, so old attempts stay interpretable.
- An item add, remove, reword-with-meaning-change or short-form flag change bumps `ITEM_BANK_VERSION`. It is defined in both `content/items.v2.ts` and `config/app.ts`, so keep the two equal.
- Coverage of `lib/scoring/**` stays at 100% (statements, branches, functions, lines): `npx vitest run --coverage`.
- Tests live in `tests/unit/scoring/` and use `build(form, perScale, fallback)` from `helpers.ts` to make complete response sets. Test boundaries at, just below and just above each threshold.
- The `Result` shape is persisted as JSON in `attempts.scores`, and the dashboards read `pattern`, `self_score`, `top_protectors` and `top_exile`. Changes must be additive or come with a migration plus a reader fallback.
- After any change, run `npm run docs:kb` so the knowledge base matches the rules.
