# Provider Workspace Operations Boundary

Status: **PROD-3 engineering foundation complete; not evidence of real-provider participation or production approval**.

This document describes the provider-side operational boundary introduced in PR #34. It is subordinate to `TALKPOINT-MVP-SPEC.md`, `PRODUCT-UX-CONTRACT.md` and the production blocker register.

## Entry point

Provider request operations are exposed through the dedicated server route:

- `GET /api/provider/requests` — organisation-scoped queue or one permitted request detail;
- `PATCH /api/provider/requests` — assignment or status transition.

The underlying `contact-requests`, `consent-records` and `provider-audit-events` Payload collections remain hidden from direct external REST access.

## Authentication and authority

Authority is derived from the authenticated Payload session. The client does not choose its organisation or role.

- `provider_manager`: may list/read requests for the authenticated organisation and may assign requests to active provider users in that same organisation.
- `provider_staff`: may list/read/update only requests assigned to that authenticated user inside the authenticated organisation.
- `super_admin` and `platform_admin`: denied identifiable provider-request access through this workspace by default.
- inactive accounts are denied; authority-changing account updates clear existing sessions.

Provider organisation, role and assignee eligibility are enforced server-side. Unexpected mutation fields are rejected.

## Identifiable data minimisation

Queue responses contain only operational fields needed to identify and manage a request. Identifiable detail is returned only after organisation/assignment checks pass and a minimal `request_viewed` audit event is successfully persisted.

The workspace does not expose:

- management-token hashes;
- anonymous session history;
- optional anonymous free text;
- AI reasoning or candidate signals;
- safety-routing history;
- other services viewed;
- internal routing state.

The provider workspace never joins anonymous session records to an identifiable request.

## Mutations and auditability

Assignment and status changes reuse the canonical provider workflow rules.

Assignment validates that the target account is:

1. a provider role;
2. active; and
3. in the same organisation as the authenticated provider manager.

Request mutation and the corresponding audit event are committed in the same PostgreSQL transaction. A failure in either operation fails closed and rolls the transaction back.

Audit records contain only actor ID, organisation ID, request ID, event type and timestamp. They do not contain names, contact details, structured summaries or notes.

## CI evidence

PR #34 final CI #184 exercises:

- unauthenticated HTTP denial;
- authenticated provider-session queue access;
- platform-role denial;
- provider deactivation/session invalidation;
- manager organisation isolation across two synthetic CI organisations;
- staff assigned-request-only visibility;
- cross-organisation request denial;
- cross-organisation assignee rejection with no persisted mutation;
- valid same-organisation assignment;
- valid and invalid status transitions;
- persisted request-view, assignment and status-change audit events;
- clean fixture deletion before the normal demonstration seed/browser suite;
- strict TypeScript, production build and full Playwright regression coverage.

All runtime fixtures used by these checks are synthetic, use `.invalid` contact data where applicable and are removed during the test.

## What PROD-3 does not prove

PROD-3 does not prove or imply:

- that any real provider has agreed to participate;
- that any provider record is approved or current for production;
- that public users can create real provider requests;
- that legal/privacy or safeguarding review is complete;
- that production hosting, identity-email delivery, MFA or external identity infrastructure is configured;
- that manual accessibility or target-user validation has been completed.

The current controlled `/api/demo-handoff` flow remains synthetic and sends no real provider request.

## Next engineering boundary

PROD-4 must create the production-side handoff boundary without weakening PROD-3:

- explicit provider-specific consent;
- exact Sharing Preview data only;
- server-derived recipient organisation from the selected integrated service;
- atomic ContactRequest + ConsentRecord persistence;
- retry-safe/idempotent submission;
- no anonymous-session join;
- no AI access to contact data;
- no synthetic provider fallback in production.
