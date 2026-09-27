# TalkPoint Production Readiness

Status: **engineering hardening in progress; not production ready**.

This document tracks the production-readiness programme without changing the frozen MVP product scope or weakening the four-domain privacy architecture.

## Current engineering checkpoint

- Controlled university MVP: implemented and CI-protected.
- Payload Admin / REST boundary: implemented in PR #30.
- PROD-1 production configuration and fail-closed directory behaviour: **complete in PR #31; final CI #165 green**.
- PROD-2 production authentication hardening: **complete in PR #33; final CI #172 green**.
- PROD-3 real provider workspace foundation: **complete in PR #34; final CI #184 green**.
- PROD-4 production handoff persistence and idempotency: **complete in PR #36; final PR CI #211 green**.
- PROD-5 retention/deletion automation: **complete in PR #38; final PR CI #235 green**.
- PROD-6 API/abuse hardening: **complete in PR #40; final PR CI #245 green**.
- PROD-7 observability/operations: **next engineering stage**.
- PROD-8 through PROD-12: not yet completed unless explicitly marked otherwise in later revisions.

PROD-4 establishes the engineering boundary for a future live assisted handoff without asserting that any real provider is participating. It adds a production-only server-authoritative Sharing Preview, derives provider/organisation routing from Payload records, requires a separate fail-closed live-handoff flag, blocks synthetic records, persists ContactRequest + ConsentRecord atomically, binds submission to the exact preview through a signed token, and makes exact retries idempotent. Direct Payload REST access to identifiable requests/consent/audit records remains denied.

PROD-5 adds configurable retention and deletion mechanics without supplying unapproved legal durations. Production withdrawal uses an opaque public request UUID plus the management credential, removes the identifiable ContactRequest transactionally, preserves only a minimal consent/deletion tombstone needed for retry/deletion semantics, and keeps active requests outside automated request-retention deletion. Expired ephemeral sessions, eligible closed requests, orphan consent records, provider audit events and anonymous analytics have explicit retention paths covered by PostgreSQL regression tests.

PROD-6 hardens the custom API boundary without assuming unavailable deployment infrastructure. Production/live DB-backed routes use a shared PostgreSQL fixed-window limiter with HMAC-derived bucket keys rather than process-local memory or stored raw client IPs. Production requires an explicit ingress-controlled client-IP header contract and dedicated rate-limit HMAC secret. Sensitive JSON routes use byte-bounded parsing and strict content type; browser-authenticated provider mutations require same-origin evidence; production handoff routes enforce the configured public origin when an Origin header is present. Baseline security headers and the Next.js 16.3.6 security patch are included. The synthetic demo retains its controlled fallback behaviour and is not made dependent on the shared limiter.

Real public use still depends on real-provider approval, verified service data, legal/privacy approval, deployment configuration and the remaining production stages.

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
| ENG-02 | PROD-2 production authentication hardening | Complete | PR #33; revocable sessions, lockout, password policy, activation/deactivation, privilege/session invalidation and runtime regression coverage; operational email recovery and MFA remain external deployment gates |
| ENG-03 | PROD-3 real provider workspace workflow | Complete | PR #34; DB-backed authenticated queue/detail access, manager organisation scope, staff assigned-only scope, same-organisation assignment validation, transactional status/audit mutations; CI #184 green |
| ENG-04 | PROD-4 production handoff | Complete | PR #36; signed exact Sharing Preview, server-derived recipient, synthetic-service block, atomic ContactRequest + ConsentRecord persistence, random protected management credential and idempotent exact retry; CI #211 green |
| ENG-05 | PROD-5 retention/deletion automation | Complete | PR #38; configurable no-default retention policy, opaque-ID withdrawal, closed-request/session/audit/analytics purge mechanics, minimal deletion tombstones and PostgreSQL regression coverage; CI #235 green. Exact legal durations remain external |
| ENG-06 | PROD-6 API/abuse hardening | Complete | PR #40; PostgreSQL shared rate limiter, HMAC-only buckets, explicit trusted ingress contract, bounded JSON, origin/CSRF protections, baseline security headers, Next.js 16.3.6; CI #245 green |
| ENG-07 | PROD-7 observability/operations | Next | Health/readiness, privacy-safe operational logging, incident/runbook and backup/restore expectations |
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
| EXT-10 | Production auth-email delivery adapter/provider and credentials | Not provided |
| EXT-11 | Approved MFA / external identity strategy and any required credentials | Not complete |

## Release rule

TalkPoint must not be described as production ready until both categories are satisfied:

1. the production engineering programme is complete with green CI and operational deployment evidence; and
2. the external validation gates relevant to the intended real deployment have documented approval/evidence.

Until then, use precise language such as **production engineering hardening in progress** or **controlled university implementation**.
