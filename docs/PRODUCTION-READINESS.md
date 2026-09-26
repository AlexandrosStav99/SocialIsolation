# TalkPoint Production Readiness

Status: **engineering hardening in progress; not production ready**.

This document tracks the production-readiness programme without changing the frozen MVP product scope or weakening the four-domain privacy architecture.

## Current engineering checkpoint

- Controlled university MVP: implemented and CI-protected.
- Payload Admin / REST boundary: implemented in PR #30.
- PROD-1 production configuration and fail-closed directory behaviour: **complete in PR #31; final CI #165 green**.
- PROD-2 production authentication hardening: **in progress in PR #32**.
- PROD-3 through PROD-12: not yet completed unless explicitly marked otherwise in later revisions.

Green CI is necessary engineering evidence, not proof of production readiness, legal compliance, safeguarding approval, accessibility conformance or provider validation.

## Runtime modes

TalkPoint has three application runtime modes:

- `development`: local development; synthetic directory fallback may be enabled.
- `demo`: controlled university demonstration; synthetic directory fallback may be enabled and must remain clearly labelled.
- `production`: fail-closed. Synthetic provider records must not be used as a fallback or presented as real provider data.

Production mode requires explicit safe configuration. Startup validation rejects, at minimum:

- placeholder or obviously development-only Payload secrets;
- local/test/placeholder PostgreSQL configuration;
- an enabled demo dashboard;
- synthetic directory fallback that is not explicitly disabled;
- missing or invalid runtime mode.

Until verified real-provider onboarding is implemented, a production directory request returns a safe unavailable state rather than synthetic records.

## Engineering blocker register

These are implementation items that can be solved in the repository and should not be confused with external approval gates.

| ID | Area | Status | Notes |
| --- | --- | --- | --- |
| ENG-01 | PROD-1 runtime/config fail-closed behaviour | Complete | PR #31; explicit runtime mode, startup validation, server/client synthetic fallback removal in production; CI #165 green |
| ENG-02 | PROD-2 production authentication hardening | In progress | PR #32: revocable sessions, password policy, lockout, reset-token limits, strict/secure cookies. Real reset-email delivery and MFA/SSO remain deployment identity dependencies; account lifecycle UI/deactivation remains for provider workspace work. |
| ENG-03 | PROD-3 real provider workspace workflow | Open | DB-backed request queue, assignment, organisation authority |
| ENG-04 | PROD-4 production handoff | Open | Persisted consented request, routing, idempotency |
| ENG-05 | PROD-5 retention/deletion automation | Open | Configurable retention; exact legal duration remains external |
| ENG-06 | PROD-6 API/abuse hardening | Open | Rate limits, request limits, CSRF/security headers, validation |
| ENG-07 | PROD-7 observability/operations | Open | Health/readiness, logging, incident/runbook, backup expectations |
| ENG-08 | PROD-8 deployment readiness | Open | Environment separation, migration/deploy/rollback flow |
| ENG-09 | PROD-9 accessibility execution readiness | Open | Code fixes/evidence preparation only; human validation remains external |
| ENG-10 | PROD-10 real-data onboarding readiness | Open | Provenance/freshness/import/admin workflow; no fictional real records |
| ENG-11 | PROD-11 safety production gate mechanics | Open | Configuration/support for approved resources only |
| ENG-12 | PROD-12 privacy/legal production gate mechanics | Open | Consent/withdrawal/export/deletion/vendor inventory/auditability |

## External production gates

These cannot be self-approved by engineering and must remain open until real evidence exists.

| ID | External gate | Current status |
| --- | --- | --- |
| EXT-01 | Real provider partnership / participation approval | Not complete |
| EXT-02 | Verified Cyprus provider directory and operational data ownership | Not complete |
| EXT-03 | Qualified safeguarding/domain review | Not complete |
| EXT-04 | Approved Cyprus immediate-support resources and wording | Not complete |
| EXT-05 | Privacy/legal review for intended deployment | Not complete |
| EXT-06 | Final production retention decisions | Not complete |
| EXT-07 | Production hosting, database, DNS and secret credentials | Not provided |
| EXT-08 | Manual accessibility testing | Not complete |
| EXT-09 | Target-user usability testing with real participants | Not complete |

## Release rule

TalkPoint must not be described as production ready until both categories are satisfied:

1. the production engineering programme is complete with green CI and operational deployment evidence; and
2. the external validation gates relevant to the intended real deployment have documented approval/evidence.

Until then, use precise language such as **production engineering hardening in progress** or **controlled university implementation**.


## PROD-2 authentication decisions

PR #32 deliberately builds on Payload's supported authentication primitives rather than introducing a second custom identity stack.

Implemented in this stage:

- one-hour authentication token/session lifetime;
- server-side sessions retained so sessions can be invalidated;
- auth tokens removed from authentication API response bodies;
- minimum 12-character passwords;
- five failed login attempts followed by a 15-minute lock;
- 30-minute password-reset token expiry and one-minute per-user reset-request throttling;
- SameSite=Strict authentication cookies, with Secure cookies required in production;
- existing super-admin/platform-admin Admin boundary and super-admin-only provider-user mutation preserved;
- provider roles remain organisation-scoped and cannot enter the Payload Admin.

Not falsely claimed:

- password-reset email delivery is not operational until a production email adapter/provider is configured;
- MFA/SSO is not enabled because no approved production identity provider or MFA delivery mechanism exists yet;
- real provider account activation/deactivation operations are not claimed until the provider workspace/account lifecycle is implemented and tested;
- these controls do not constitute an external security or legal approval.
