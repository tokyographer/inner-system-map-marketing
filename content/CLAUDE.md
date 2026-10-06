# content: copy and the item bank

This whole folder is core (see `CORE.md`): it must stay identical in the marketing repo, so port every change with `core-sync`. Marketing copy never goes here; it lives in `marketing/` in the marketing repo.

English is the master. ES, RO and TR are drafts: every translated file starts with "DRAFT, pending human review", and the locales test checks for it. All copy is DRAFT pending Anthony's clinical review.

## Layout
- `items.v2.ts`: 84 items `{ id, scale, block, short, text }`, with 63 marked `short`. IDs are permanent, because stored attempts and the review spreadsheets reference them. `items.v2.<l>.ts` maps every ID to translated text, with no extras.
- Per-locale modules with suffixed exports (`TYPOLOGIES_ES`, `PATTERNS_RO`, ...): `typologies`, `exiles`, `patterns` (patterns, modifiers, band labels, framing, care note, disclaimer), `exercise` (intro, S.W.C.I.R. steps, belief frame), `support-resources`, `level-two`.
- Shared files: `pairings.ts` (protector → exile), `pdf-labels.ts` and `email-labels.ts` (all locales in one map; email templates use `{app}`/`{name}`/`{months}`/`{url}` placeholders filled by `fillTemplate`), `legal/privacy.ts`.
- `index.ts` maps everything into one `Content` per locale. A new piece of copy needs a field on `Content` and an entry in all four locale blocks.
- UI chrome strings live in `messages/<l>.json`, not here. All four files must have the EN key set.

## Voice rules (IFS)
- Use part language only: "a part of you that…". Never "you are a…", never a label for the person.
- Every protector gets a respectful, curious tone ("no bad parts"). Write wounds in a tentative voice ("may carry…").
- Exiles are approached only through protectors. Exile copy never invites the reader to go to an exile, and the exercise addresses the leading protector only.
- A low exile score alongside strong protectors means the protectors may be succeeding, not that there are no exiles.
- Never use the forbidden words in any locale (see the list in `tests/unit/content/locales.test.ts`): diagnosis, disorder, clinical, scientifically validated, and their translations.
- Bands and thresholds are the school's heuristics, never norms or percentiles.
- Keep "Self" capitalised. Keep Yesod, Tiferet and Kay Pacha untranslated.
- Spanish uses gender-neutral phrasing where possible.

## When you change copy
1. Edit EN, then the same key in ES, RO and TR (a draft is fine; keep the header).
2. When rewording an item, apply it in all locales in one commit: `docs: reword <ID> ..., all locales`.
3. Run `npm test` (locales and results-order tests) and `npm run docs:kb`.
