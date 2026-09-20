# TalkPoint MVP readiness

## Automated implementation status

The controlled university demonstration now exercises the product path in the browser from the 18+ gate through structured check-in, deterministic service discovery and a synthetic consented handoff into the provider-queue domain workflow.

The handoff endpoint deliberately uses the reserved `.invalid` fictional contact address, creates no persistent record and sends nothing to a real provider. It exists to prove integration without collecting personal data in an unvalidated university prototype.

Implemented and CI-verified foundations include:
- four-domain privacy architecture and database constraints;
- checked-directory and synthetic-directory contracts;
- deterministic conversation, discovery and safety boundaries;
- optional AI provider abstraction with deterministic fallback;
- consent/contact-request domain boundaries;
- organisation-scoped provider RBAC/workflow;
- thresholded anonymous analytics;
- EN/EL core check-in;
- reduced-motion and automated accessibility regressions;
- production-build and Playwright regression coverage.

## Deliberate deployment gates

These are not code failures and must not be represented as completed until evidence exists:

1. **Payload/PostgreSQL runtime deployment.** SQL migrations and repository/domain contracts exist, but the public university demo intentionally does not persist contact requests. A real deployment must provision PostgreSQL, install/configure Payload against the locked dependency graph, run migrations and replace demo repositories with DB-backed implementations.
2. **Real authentication.** Provider RBAC is implemented at the domain boundary, but production identity, session management and MFA/organisation onboarding require a deployment identity decision.
3. **Safety expert validation.** Exact trigger wording, matrix and Cyprus immediate-support resources require qualified domain-expert approval.
4. **Legal/privacy review.** Real Cyprus operation requires review of controller/processor roles, lawful basis, notices, consent wording, retention and data-subject procedures.
5. **Target-user study.** Usability evidence with adults 18–30 must be collected and analysed.
6. **Manual accessibility audit.** WCAG 2.2 AA is a target, not a certification claim.

## Release rule

Do not label TalkPoint production-ready until all six deployment gates above have evidence. Green CI proves the controlled MVP implementation and automated invariants only.
