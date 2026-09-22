# TalkPoint MVP Readiness

Status: **controlled implementation technically complete; full frozen Definition of Done not yet satisfied**.

## Automated implementation status

The controlled university demonstration exercises the product path in the browser from the 18+ gate through structured check-in, deterministic service discovery and a synthetic provider-specific consented handoff into the provider-queue workflow boundary.

The demo handoff deliberately uses fictional `.invalid` contact data and sends no real request to a provider. This proves the consent/handoff integration path without collecting real contact data or implying a live partnership.

Implemented and CI-verified foundations include:

- four-domain privacy architecture and persistence constraints;
- Payload CMS + PostgreSQL runtime integration;
- committed/version-controlled Payload migration applied to clean PostgreSQL in CI;
- live PostgreSQL round-trip verification;
- provider organisations and organisation-scoped RBAC foundations;
- checked-directory and synthetic-directory contracts;
- idempotent seeding of the controlled synthetic provider/service directory into Payload/PostgreSQL;
- a Payload-backed directory API consumed by the public check-in, with a clearly synthetic static fallback when DB configuration/data is unavailable;
- browser verification that the full CI runtime serves the demonstration directory from PostgreSQL rather than the fallback;
- deterministic conversation, discovery and safety boundaries;
- optional AI provider abstraction with deterministic fallback;
- consent/contact-request domain boundaries;
- thresholded anonymous analytics;
- EN/EL critical journey;
- accessibility/mobile/reduced-motion browser regressions;
- dependency security gate, zero-warning lint, TypeScript and production build;
- Playwright coverage of privacy, consent, no-match, handoff failure/retry and critical UX states.

The synthetic directory remains deliberately small: two fictional providers and two fictional services. This is enough to demonstrate directory-backed matching and the controlled assisted-handoff path while preserving an honest no-exact-match scenario. It must not be presented as comprehensive Cyprus service coverage.

## Validation gates still open

These are not code failures and must not be represented as complete until real evidence exists.

1. **Problem-validation academic synthesis.** Existing requirements/research evidence must be brought into the final academic chain, including assumptions that remained unvalidated.
2. **Manual accessibility validation.** Automated regressions exist, but screen-reader, keyboard-only full journey, zoom/reflow, physical-device and final manual contrast/status-announcement evidence still needs to be executed and recorded.
3. **Safety/domain review.** Exact trigger wording/matrix and any real Cyprus immediate-support resources require qualified safeguarding/domain approval.
4. **Privacy/legal review.** Real Cyprus operation requires authorised review of lawful bases, notices, roles, retention, data-subject procedures, vendors/transfers and deployment controls.
5. **Target-user study.** Approximately 5–8 real target participants aged 18–30 must be evaluated, material findings recorded and critical/high problems iterated/retested.
6. **Real provider/directory validation.** Complete checked real service data, data-freshness ownership and any real integrated-provider pilot require direct validation/agreement.
7. **Academic closure.** Final evaluation must combine actual technical and human evidence, failures, trade-offs, changes and unresolved limitations.

## Production deployment boundary

Payload/PostgreSQL runtime and the controlled synthetic directory integration are no longer future implementation items. What remains unproven is a real production environment and real-provider operation, including as applicable:

- production infrastructure provisioning and configuration;
- production identity, session management, MFA and onboarding;
- environment-specific security assessment, monitoring and incident response;
- real operational retention/deletion settings;
- real provider agreements and DB-backed operational request handling if a pilot requires it;
- complete checked directory content and revalidation process.

The controlled university demo intentionally does not turn those production-operational gaps into fake live behaviour.

## Evidence sources

Use together:

- `TALKPOINT-MVP-SPEC.md`;
- `VALIDATION-EVIDENCE-MATRIX.md`;
- `UX-5-VALIDATION-STATUS.md`;
- `MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md`;
- `UX-5-USABILITY-TEST-PLAN.md`;
- `USABILITY-SESSION-RECORD-TEMPLATE.md`;
- `SAFETY-CONTENT-VALIDATION-CHECKLIST.md`;
- `PRIVACY-LEGAL-VALIDATION-CHECKLIST.md`;
- `PROVIDER-VALIDATION-CHECKLIST.md`;
- `ACADEMIC-CLOSURE-TEMPLATE.md`.

## Release/claim rule

Green CI supports the claim that the frozen controlled implementation has reproducible technical evidence.

Do **not** call TalkPoint fully MVP-DONE or production-ready until the remaining external validation gates have actual evidence and the final academic Definition-of-Done decision is documented.
