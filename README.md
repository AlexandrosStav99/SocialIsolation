# TalkPoint

**Support Navigation & User-Directed Referral Platform**

TalkPoint is a controlled university MVP for adults aged 18–30. It helps an anonymous user describe the kind of support they are looking for, discover relevant services through deterministic routing, and optionally make a provider-specific assisted contact request after an explicit Sharing Preview and consent step.

TalkPoint is **not** a therapist, diagnostic system, emergency service, clinical recommender or production support platform.

## MVP status

**Product implementation:** complete for the controlled university demonstration.  
**Technical verification:** full CI green on the production repository.  
**External validation / academic closure:** still requires real human and domain evidence.  
**Production readiness:** not claimed.

The frozen product scope and claim boundary are defined in:

- [`docs/TALKPOINT-MVP-SPEC.md`](docs/TALKPOINT-MVP-SPEC.md)
- [`docs/FINAL-MVP-READINESS.md`](docs/FINAL-MVP-READINESS.md)
- [`docs/VALIDATION-EVIDENCE-MATRIX.md`](docs/VALIDATION-EVIDENCE-MATRIX.md)

## Core demonstrable journey

```text
Anonymous adult user
→ 18+ confirmation
→ conversational structured check-in
→ Support Context
→ safety navigation where relevant
→ deterministic Service Discovery
→ factual service explanations
→ self-service OR assisted contact
→ exact Sharing Preview
→ provider-specific explicit consent
→ controlled provider workflow boundary
→ separate privacy-safe aggregate analytics
```

The user can also recover honestly from a no-exact-match result. TalkPoint does not fabricate a service match merely to complete the flow.

## What is implemented

- anonymous-first check-in with no account requirement;
- Greek and English critical journey;
- one primary topic plus optional related topics;
- optional bounded free text with privacy guidance;
- deterministic and explainable service discovery;
- no-match recovery and broader-directory browsing;
- persistent Help now / safety-navigation entry point;
- exact Sharing Preview before assisted contact;
- provider-specific explicit consent;
- controlled fictional assisted-handoff path;
- provider organisation, provider user, RBAC and queue foundations;
- privacy-safe anonymous analytics boundaries;
- mobile, keyboard, reduced-motion and accessibility regression coverage;
- full automated CI across security, TypeScript, architecture, database, build and browser tests.

## Architecture and data boundaries

Technology baseline:

- **Next.js**
- **Payload CMS**
- **PostgreSQL**
- optional **OpenAI API** behind a server-side provider abstraction
- deterministic fallback when AI is unavailable

The implementation deliberately separates:

1. **Ephemeral Conversation** - temporary anonymous navigation state.
2. **Anonymous Analytics** - de-identified structured aggregate events.
3. **Identifiable Contact Request** - created only after explicit assisted-contact choice and consent.
4. **Consent Record** - separate provider-specific authorisation evidence.
5. **Directory / Identity** - provider organisations, users, providers and services.

Contact details are not part of the anonymous check-in and are not sent to the AI provider.

## PostgreSQL / Payload directory

The MVP uses a real PostgreSQL database integrated through Payload CMS.

The controlled demo flow includes:

- committed Payload migrations;
- clean-database migration verification in CI;
- an idempotent synthetic directory seed;
- two fictional providers and two fictional services stored in Payload/PostgreSQL;
- `/api/directory` reading the demonstration directory from Payload;
- the public check-in consuming that API;
- a clearly synthetic static fallback if the database is unavailable or empty;
- browser regression evidence that CI serves the directory from `payload_postgres`.

The synthetic dataset is intentionally small so the MVP demonstrates both an exact-match journey and an honest no-match journey.

## Demo-data boundary

Use **fictional information only**.

The current MVP:

- does not claim live provider partnerships;
- does not send a real provider request;
- uses fictional `.invalid` contact details in the controlled assisted-handoff path;
- does not contain a complete Cyprus support-service directory;
- does not claim legal, safeguarding or WCAG certification;
- does not claim production readiness.

Do not replace these boundaries with fake live behaviour for a demonstration.

## Local setup

Use Node 24:

```sh
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

The UI can still demonstrate the synthetic fallback directory when PostgreSQL is not available.

### Full Payload/PostgreSQL demo

For the full database-backed demonstration, run PostgreSQL and configure the server-side values in `.env.local`, then apply the committed migration and seed the synthetic directory:

```sh
npm run payload -- migrate
npm run seed:demo
npm run dev
```

A successful full demo can be checked at:

```text
http://localhost:3000/api/directory
```

The JSON response should show:

```json
{
  "label": "Demonstration Data",
  "source": "payload_postgres"
}
```

If the source is `synthetic_fallback`, the UI remains demonstrable but PostgreSQL is not currently serving the directory.

### Synthetic dashboard preview

`/dashboard` returns 404 by default. To preview the controlled synthetic dashboard visuals, set:

```env
TALKPOINT_ENABLE_DEMO_DASHBOARD=true
```

Restart the app after changing the flag. This flag is **not authentication** and must never be used as a substitute for real production identity/session controls.

The optional `NEXT_PUBLIC_MAPBOX_TOKEN` is a public browser token. Leave it blank for the default offline-friendly demo unless a restricted Mapbox token is intentionally configured.

## Demo and presentation material

- [`docs/DEMO-VIDEO-INSTRUCTIONS.md`](docs/DEMO-VIDEO-INSTRUCTIONS.md) - recommended recording flow, exact demo scenarios, narration and pre-flight checks.
- [`docs/PRESENTATION-GPT-BRIEF.md`](docs/PRESENTATION-GPT-BRIEF.md) - master prompt and evidence rules for generating an accurate TalkPoint academic presentation with GPT.

## Verification

Core local verification:

```sh
npm run audit
npm run lint
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npm test
```

CI additionally verifies:

- Phase 1–10 architecture and evidence invariants;
- dependency security gate;
- Payload runtime;
- privacy persistence boundaries;
- provider RBAC and consent hardening;
- committed migration against clean PostgreSQL;
- synthetic Payload directory seed;
- live PostgreSQL round trip;
- production build;
- Playwright production regressions.

Green CI is strong engineering evidence. It is not evidence of legal compliance, safeguarding approval, WCAG certification or real-user usability validation.

## Validation still to execute

The repository already contains protocols/templates for the remaining non-code evidence:

- manual accessibility validation;
- target-user usability sessions;
- safeguarding/domain review;
- privacy/legal review where required;
- provider/data validation for any real pilot;
- final academic evaluation and limitations synthesis.

Do not fabricate completion rates, participant quotes, expert approvals, provider partnerships or real-world deployment evidence.

## Repository guidance

The frozen MVP specification is the source of truth. Product scope should not be reopened merely because further development is possible. Additional implementation is justified only by a concrete defect, a frozen-requirement failure or a material validation finding.
