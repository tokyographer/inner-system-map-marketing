# WhatsApp: operations guide

How the Inner System Map uses WhatsApp, what is set up in Meta, and how to switch each part on. Code details are in `CLAUDE.md`, `db/CLAUDE.md` and `docs/AGENT-CHANGELOG.md`; this file covers what lives outside the repo.

This is the marketing repo's copy of upstream's guide (`../inner-system-ifs-test/docs/WHATSAPP.md`). Both flags are core: they change upstream and arrive here through the `core-sync` agent. Stage 1 runs in whichever deployment serves the public flow. Stage 2, the inbox, runs only in the upstream app: this repo has its core helpers (`lib/whatsapp/webhook.ts`, `lib/whatsapp/reply.ts`) and migration 0011, but no webhook route, inbox pages or inbox retention.

Never put the access token, the app secret, the verify token or the two-step PIN in this repo. They belong in a password manager and in Vercel environment variables.

## What exists

| Part | Switch (`config/app.ts`) | Status |
|---|---|---|
| Results PDF on WhatsApp (stage 1) | `WHATSAPP_RESULTS_READY` | built, off |
| Admin WhatsApp inbox (stage 2) | `WHATSAPP_INBOX_READY` | built upstream, off; not in this repo |

Both are independent. Each adds its own paragraph to the privacy notice and changes `CONSENT_POLICY_VERSION` when switched on.

## Meta setup (done once)

- **Business number:** registered on the WhatsApp Cloud API under the Transcendent Institute WhatsApp Business Account, display name "Transcendent Institute". Because it is on the Cloud API, it cannot also be used in the WhatsApp or WhatsApp Business phone app.
- **Meta app:** the app with the WhatsApp use case. A second app exists that has only Facebook Login; tokens from that app fail with `Invalid application ID`.
- **System user:** "admin" in Business Settings > Users > System users. It needs both assets with full control: the WhatsApp app and the WhatsApp Business Account. Its permanent token needs `whatsapp_business_messaging` and `whatsapp_business_management`. Revoke tokens nobody uses.
- **Two-step PIN:** set during registration; keep it in the password manager. Meta asks for it when the number is re-registered.
- **IDs:** the phone number ID (for `WHATSAPP_PHONE_NUMBER_ID`) and the WhatsApp Business Account ID are shown in the app dashboard under WhatsApp > API Setup.

## Results template (stage 1)

Create it in WhatsApp Manager > Message templates.

- Name `inner_system_map_results`, category **Utility**, variable type **Number**.
- Header: **Document** (the code attaches each person's PDF). No header text, no footer, no buttons; marketing-style buttons can move the template to the Marketing category.
- Review samples: a made-up name such as `Ana` for `{{1}}`, and a sample PDF with a fake name and invented answers, never a real person's results.
- Languages and bodies (ES/RO/TR are drafts; have a native speaker check them):
  - en: `Hello {{1}}, your Inner System Map results are attached as a PDF. Thank you for taking the time to reflect.`
  - es: `Hola, {{1}}: adjuntamos en PDF tus resultados del Mapa del Sistema Interno. Gracias por tomarte el tiempo de reflexionar.`
  - ro: `Bună, {{1}}! Rezultatele tale din Harta Sistemului Interior sunt atașate ca PDF. Îți mulțumim că ți-ai făcut timp pentru reflecție.`
  - tr: `Merhaba {{1}}, İç Sistem Haritası sonuçların PDF olarak ekte. Düşünmeye zaman ayırdığın için teşekkür ederiz.`
- After approval, check that the language codes WhatsApp Manager shows match `WHATSAPP_TEMPLATE_LANGUAGE` in `config/app.ts` (`en`, `es`, `ro`, `tr`; Meta sometimes uses `en_US`).

## Costs

- Business-started templates (the results message) are charged per delivered message, at a rate that depends on the recipient's country. A payment method must be on the WhatsApp Business Account. Check Meta's current price list; rates change.
- Free-text replies inside the 24-hour customer service window (the inbox) are free.
- No inbox subscription: replies are handled in this app.

## Switching on stage 1 (results PDF)

1. Template approved in all four languages.
2. Payment method on the WhatsApp Business Account.
3. Migration `0010_public_results_whatsapp.sql` applied to this deployment's production database (a deliberate step; `npm run db:migrate` runs only against `marketing-dev` during development).
4. `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` set in Vercel for every environment (`WHATSAPP_TEMPLATE` only if the name differs).
5. Legal review: consent to send the results PDF through Meta, possibly outside the EU.
6. Set `WHATSAPP_RESULTS_READY = true` upstream, port it here with `core-sync`, deploy, and run the public flow once with your own number.

## Switching on stage 2 (inbox, upstream only)

The inbox is switched on in the upstream app only, by the steps in upstream's `docs/WHATSAPP.md` (summarised here). Porting `WHATSAPP_INBOX_READY = true` to this repo changes only the privacy notice and `CONSENT_POLICY_VERSION` here.


1. Migrations `0010` and `0011` applied to production.
2. `WHATSAPP_APP_SECRET` (app dashboard > App settings > Basic) and `WHATSAPP_VERIFY_TOKEN` (a long random string) set in Vercel, with the stage 1 variables.
3. Set `WHATSAPP_INBOX_READY = true` and deploy.
4. App dashboard > WhatsApp > Configuration: callback URL `https://ifs-test.transcendentinstitute.com/api/whatsapp/webhook`, the same verify token, then subscribe to the `messages` field. Turn on "Suscribir webhooks" for the WhatsApp Business Account.
5. Write to the business number from a personal phone and check that the message appears in `/en/admin/whatsapp` and that the institute inbox gets the notice.

A Meta app has one webhook callback URL, and it points at the upstream app. If this repo ever becomes the live app (README, "Going live"), the inbox code has to be ported first; until then, if another site uses the same number, only one deployment can receive the replies; decide which before connecting a second one.

## Answering people (upstream inbox)

- Replies are free text only within 24 hours of the person's last message. After that the inbox closes the reply box; the person has to write again.
- Photos, voice notes and files are not downloaded; the inbox shows only their type and caption.
- Erasure requests: open the conversation and use "Delete conversation". The results deletion link does not delete WhatsApp conversations, because the number on a result is not verified.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `Invalid OAuth access token - Cannot parse access token` (190) | The token was pasted with extra characters, or the clipboard held something else. |
| `Error validating application. Invalid application ID` (190) | Token from the app without WhatsApp. Generate one for the WhatsApp app. |
| `Object with ID ... does not exist ... missing permissions` (100/33) | Wrong phone number ID, or the system user lacks the WhatsApp account asset. |
| "No hay permisos disponibles" when generating a token | The system user has no role on that app. Assign the app under Asignar activos. |
| `whatsappSent: false`, log `not_configured` | `WHATSAPP_TOKEN` or `WHATSAPP_PHONE_NUMBER_ID` missing in Vercel. |
| log code `132001` | Template name or language code does not match an approved template. |
| log code `131042` | No payment method on the WhatsApp Business Account. |
| log `recipient_rate_limited` | That number already received 2 results in 24 hours. |
| Webhook returns 401 | `WHATSAPP_APP_SECRET` does not match the Meta app. |
| Webhook returns 503 | A `WHATSAPP_*` variable is missing. |
| Messages never reach the inbox | `messages` field not subscribed, or `WHATSAPP_INBOX_READY` is off (the webhook then acknowledges without storing). |
