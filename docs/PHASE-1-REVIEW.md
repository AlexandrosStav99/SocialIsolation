# Phase 1 Review — Core Architecture & Data Boundaries

## Status

Phase 1 implementation review. Product scope remains frozen.

## Implemented

- PostgreSQL schema foundation for directory/identity, ephemeral sessions, anonymous analytics, contact requests and consent evidence.
- Organisation and role model foundation.
- Directory contracts for providers and services.
- Explicit ephemeral-session interface and expiry contract.
- Anonymous analytics contract with no session/request/user/contact identifier.
- Contact-request and provider-specific consent integrity checks.
- Platform-role default denial for identifiable provider requests.
- Privacy-safe logging helper and forbidden-content filtering.
- Server-only environment configuration contract.
- Database integrity/index migration.
- CI privacy/data-boundary invariant checks.

## Critical invariants

1. Anonymous analytics has no FK to sessions, contact requests or users.
2. Analytics events contain no contact detail, preferred name or raw free text.
3. Full conversation transcripts are not modelled for durable storage.
4. Optional notes require explicit authorisation.
5. Provider roles require organisation scope.
6. Super Admin and Platform Admin do not gain identifiable-request access merely from platform role.
7. Sensitive user content is excluded from the safe logging interface.
8. Session lifetime is configurable and does not pretend to settle the final production retention policy.

## Security / privacy review

Phase 1 intentionally establishes boundaries before implementing the later sensitive workflows. Database schema does not replace API-level authorisation. Full organisation-isolation enforcement and adversarial direct-API tests remain Phase 7.

The SQL schema is a baseline storage contract. Payload is intended to own directory/content/admin data, but directory implementation and seeded checked service content are Phase 2. Routing and Safety Routing must remain application code rather than CMS-editable rules.

## Intentionally deferred

- actual conversational state machine: Phase 3;
- service discovery and safety routing: Phase 4;
- AI provider integration: Phase 5;
- assisted-contact UI and real request creation workflow: Phase 6;
- complete authentication/provider workspace and organisation-isolation enforcement: Phase 7;
- analytics UI/heatmap: Phase 8;
- final production retention duration and legal wording: validation items.

## Exit assessment

The Phase 1 exit criterion is architectural: storage boundaries must exist before sensitive workflows are built. The repository now contains explicit, testable boundaries and CI checks. A deployed PostgreSQL/Payload environment is not represented as live or production-ready.

Phase 1 must only be marked complete after the final PR CI is green and the diff is reviewed against the frozen specification.
