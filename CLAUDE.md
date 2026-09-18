# Inner System Map

## Purpose
Self-report screener that maps a person's inner system in Internal Family Systems (IFS) terms for Transcendent Institute: how much Self-leadership is available, which group of parts leads (Managers, Firefighters, Exiles) and which parts are most active. Public mode (website lead tool) and cohort mode (program participants with facilitator dashboard). Not a diagnostic or validated instrument; copy must say so.

## Architecture
- `content/items.v2.ts` → item bank (84 items, stable IDs, short-form flags). Translations and typology/exile copy in `content/*.{en,es,ro}.ts`.
- `config/scoring.ts` → every threshold (heuristic, never norms). `config/app.ts` → names, forms, retention.
- `lib/scoring/` → pure scoring engine: `score(input) → Result` (scales, leads, pattern, modifiers, ranking, pairings, flags). No I/O.
- `lib/pdf/` → results PDF (@react-pdf/renderer), same static content as the results page, section 8 order.
- `lib/email/send-results.ts` → Resend: one email to the person, a separate copy to `RESULTS_COPY_TO`.
- `app/api/public/results-pdf` (POST → PDF) and `app/api/public/email-results` (POST → sends). Both zod-validated and rate limited.
- Phases 3–7 (UI, i18n, Supabase, dashboard, retention) are planned in `docs/PHASE-1-PLAN.md`.

## Run Order
```
npm install
cp .env.example .env        # fill RESEND_* to send email
npm run typecheck
npm test                    # vitest, scoring engine must stay at 100% coverage
npm run dev
```

## Hardware & Environment
- Node 24+, npm. Deploy target: Vercel, region fra1 (EU). Supabase EU project (Phase 5).

## Key Dependencies & Gotchas
- Next 16 App Router. `@react-pdf/renderer` is in `serverExternalPackages`; PDF routes set `runtime = "nodejs"`.
- Vitest config is `vitest.config.mts` (ESM). Tests live in `tests/unit/**`.
- Pattern rules are evaluated in order; a manager/firefighter gap of exactly 0.3 resolves to MANAGED or REACTIVE, not POLARISED.
- Team-of-protectors rule: top two, plus the third when within 0.4 of the second (assumption, see plan).
- Rate limiting is in-memory for now (soft). Replace with Upstash in Phase 7.
- macOS `sips` does not rasterise the PDF's standard Helvetica; the text is there. Use Preview or pdftoppm to check visually.

## Configuration
- `.env` from `.env.example`. `RESULTS_COPY_TO` empty disables the institute copy.

## Never Do
- Never type people ("you are a ..."). Part language only.
- Never use "diagnosis", "disorder", "clinical", "scientifically validated" in user-facing copy (test enforces).
- Never add self-harm or suicidality items.
- Never show exile content before protector content; never write an exercise addressed to an exile.
- Never log responses, emails or scores. Log job outcome and reason only.
- Never present thresholds as norms.
- Never commit `.env`.

## Current Status
- Done: Phase 1 plan, Phase 2 scoring engine + item bank + EN content (100% coverage), results PDF, Resend email flow with institute copy, request validation, interim rate limiting.
- Not done: questionnaire UI, results page, ES/RO, Supabase, cohort mode, dashboard, retention, e2e.
- Item bank and content are DRAFT pending Anthony's clinical review.

## Future Integration
- Input: item responses `{ itemId: 1..5 }` + form + locale. Output: `Result` JSON, PDF, email. Cohort data to Supabase (Phase 5).
