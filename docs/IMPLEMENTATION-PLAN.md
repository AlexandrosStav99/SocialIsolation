# TalkPoint MVP v1.0 Implementation Plan

This plan translates the frozen product specification into implementation work. It is deliberately dependency-first rather than “most impressive feature first”.

## Phase 0 — Baseline hardening
- Remove sensitive check-in text from URL/query-string transport.
- Remove or relabel unsupported live/compliance claims.
- Remove random user heatmap data and hard-coded operational data presented as live.
- Upgrade framework/dependencies to a supported secure baseline.
- Establish environment configuration and secret handling.
- Add baseline lint/type/build/test CI.

**Exit:** existing prototype no longer makes misleading privacy/live claims and builds cleanly.

## Phase 1 — Core architecture and data boundaries
- Integrate PostgreSQL.
- Integrate Payload CMS.
- Model organisations, provider users and roles.
- Model providers/services and directory metadata.
- Define ephemeral-session mechanism.
- Define anonymous analytics events separately from identifiable requests.
- Define contact requests and consent records.
- Add redacted logging policy/helpers.

**Exit:** storage boundaries exist before sensitive workflows are built.

## Phase 2 — Directory and checked service data
- Implement support taxonomy.
- Implement provider/service collections.
- Add service area, languages, eligibility, mode, contact channels, hours, provider type, information source/check date and immediate-support capability.
- Seed controlled development/demo data.
- Begin checked Cyprus directory dataset.

**Exit:** application can query structured service data without hard-coded provider logic.

## Phase 3 — Deterministic conversation engine
- Replace scripted check-in with state-machine/decision-tree flow.
- Add 18+ gate.
- Add primary + secondary topic collection.
- Add service-area/preferences collection.
- Add optional 500-character free-text step.
- Implement Greek/English controlled copy.
- Implement deterministic fallback flow independent of AI.
- Add unit tests for branches and edge cases.

**Exit:** complete check-in works without AI.

## Phase 4 — Service Discovery and Safety Routing
- Implement hard eligibility filtering.
- Implement deterministic fit rules.
- Return up to 3 relevant services.
- Add factual “why you are seeing this” explanations.
- Implement no-match recovery.
- Add persistent “I need help now”.
- Implement structured Safety Routing framework.
- Keep final production safety matrix behind validation gate.
- Add routing/safety test fixtures.

**Exit:** identical structured inputs produce reproducible, explainable outputs.

## Phase 5 — AI conversation layer
- Add server-side AI provider interface.
- Integrate GPT-5.4 mini.
- Add constrained structured outputs.
- Validate AI outputs before application use.
- Minimise context sent to provider.
- Prevent contact/identity fields from entering AI prompts.
- Implement timeout/invalid-output fallback to deterministic conversation.
- Do not log raw prompts/responses containing user content.

**Exit:** AI improves free-text conversation but failure does not break core journey.

## Phase 6 — Assisted contact and consent
- Add self-service provider contact path.
- Add integrated/demo-provider assisted path.
- Implement preferred-name + one-contact-method collection.
- Implement Sharing Preview.
- Implement provider-specific consent record.
- Add separately consented optional note.
- Generate random request management ID/mechanism.
- Implement withdrawal/deletion workflow appropriate to demo environment.

**Exit:** no identifiable request exists without explicit user-directed action and consent.

## Phase 7 — Authentication, RBAC and provider workspace
- Implement Super Admin, Platform Admin, Provider Manager and Provider Staff roles.
- Enforce organisation isolation server-side.
- Build provider request queue.
- Implement assignment/status/outcome lifecycle.
- Prevent Provider A access to Provider B data even via direct API requests.
- Add sensitive-action audit events without sensitive payloads.

**Exit:** provider workflow functions and permission tests prove isolation.

## Phase 8 — Privacy-safe analytics
- Record de-identified anonymous events.
- Build operational analytics.
- Build support-topic analytics.
- Implement district/service-area heatmap from aggregate data.
- Add minimum sample suppression.
- Label synthetic university data as Demonstration Data.
- Ensure analytics cannot expose identifiable request details.

**Exit:** dashboard is useful without pretending synthetic data is real.

## Phase 9 — UX, bilingual and accessibility hardening
- Complete EL/EN content parity.
- Mobile-first QA.
- Keyboard/focus/semantic/label checks.
- Screen-reader status behaviour.
- Contrast checks.
- Automated accessibility scan plus manual checks.
- Error/empty/loading/no-match states.

**Exit:** no known critical accessibility or bilingual-flow break.

## Phase 10 — Verification and academic validation
- End-to-end test scenarios.
- Routing test matrix.
- RBAC/organisation-isolation security tests.
- Privacy/logging/deletion tests.
- Domain-expert review of safety wording/rules/resources.
- Target-user usability study with 18–30 users.
- Document findings and implement material corrections.
- Record limitations and unresolved production requirements.

**Exit:** Definition of Done evidence exists.

## Scope rule
Do not add a new MVP feature unless evidence shows it fixes a critical functional, safety, privacy/security, accessibility or validation failure.
