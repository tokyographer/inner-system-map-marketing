# Core contract

The Inner System Map lives in two repositories that share git history:

- **upstream**: `inner-system-ifs-test`, the original app. It is the source of truth for the core.
- **marketing**: `inner-system-map-marketing`, a clone with lead-generation features. It has git remote `upstream` pointing at the original.

The core below must be identical in both. `npm run core:fingerprint` prints one hash over it; equal hashes in both repos mean the cores match. This file is itself core, so keep it repo-neutral.

## Core paths
- `CORE.md`
- `config/app.ts`, `config/scoring.ts`
- `content/` (items, translations, typologies, exiles, patterns, exercise, support, level two, PDF and email labels, legal)
- `lib/scoring/`, `lib/questionnaire/`, `lib/pdf/`, `lib/email/`, `lib/whatsapp/`, `lib/validation/`, `lib/db/`
- `components/results/sections.ts` (the results-page order invariant)
- `db/migrations/0*.sql`
- `messages/*.json`, except the top-level `"marketing"` key
- `tests/unit/scoring/`, `tests/unit/content/`, `tests/unit/pdf/`, `tests/unit/email/`, `tests/unit/whatsapp/`, `tests/fixtures/`

The path list is duplicated in `scripts/core-fingerprint.mjs`. Change both together.

## Sync rules
1. **Direction.** Core changes start upstream. A core change found or needed in marketing is committed upstream in the same session, then ported. The `core-sync` agent does the porting.
2. **Versions.** `SCORING_VERSION` and `ITEM_BANK_VERSION` change only upstream.
3. **Migrations.** Upstream numbers core migrations `0NNN_*.sql`. Marketing-only migrations use `m0NNN_*.sql` and never touch core tables except to add marketing-only columns or tables. `scripts/migrate.mjs` tracks files by name, so both sequences coexist.
4. **Marketing code stays outside core paths.** Marketing copy and code go in `marketing/`. Marketing UI strings go under the `"marketing"` key in `messages/*.json`, in all four locales.
5. **Golden results.** `tests/unit/scoring/golden.test.ts` checks `score()` against `tests/fixtures/core-golden.json`. Regenerate the fixture (`npm run core:golden:update`) only when a deliberate core change upstream alters scoring, and port the new fixture with that change.
6. **Changelog.** Each `docs/AGENT-CHANGELOG.md` entry is tagged `[core]` or `[marketing]`. A `[core]` entry has a `Synced:` line naming the commit in the other repo, or `pending`.
7. **Done means synced.** A task that changes a core path is not finished until the change is in both repos and both fingerprints match, or the `Synced:` line says `pending` with a reason.

## Safety rules (both repos)
- Never type people ("you are a ..."). Part language only ("a part of you that ...").
- Never use "diagnosis", "disorder", "clinical" or "scientifically validated" in user-facing copy, in any locale (`tests/unit/content/locales.test.ts` enforces this). This includes ads and marketing emails.
- Never add self-harm or suicidality items.
- Never show exile content before protector content. Never write an exercise addressed to an exile.
- Never present thresholds as norms.
- Never log responses, emails, WhatsApp numbers, names or scores. Log the job outcome and reason only.
- Never use `asService()` for a request a signed-in person makes.
- Never edit an applied migration.
- Never import a `content/*.en.ts` file directly from a component. Go through `getContent()`.
- Never commit `.env` or `.env.local`.
- Never send results, patterns or scores to ad platforms or email tools, and never build audiences from them.
- WhatsApp carries results only to the number the person gave on the start screen, only after their explicit WhatsApp consent, only as the approved Utility template, and only through `lib/whatsapp/` (rate limited per recipient, name sanitised before it enters the template). Never use stored WhatsApp numbers for promotion, broadcasts or audiences.
- Never send promotional messages to a person whose pattern is FLOODED.
- WhatsApp inbox messages are read and answered only by admins, only within WhatsApp's 24-hour reply window, and are never exported, analysed or used for marketing. Media is never downloaded.
