# TalkPoint Production Retention & Deletion Operations

Status: **application mechanics implemented; final legal retention durations not approved in-repo**.

This document describes the operational boundary added in PROD-5. It is not a retention policy approval and does not supply legal durations.

## Required production configuration

The retention runner requires explicit values for:

- `TALKPOINT_RETENTION_CONTACT_REQUEST_DAYS`
- `TALKPOINT_RETENTION_CONSENT_RECORD_DAYS`
- `TALKPOINT_RETENTION_PROVIDER_AUDIT_DAYS`
- `TALKPOINT_RETENTION_ANONYMOUS_ANALYTICS_DAYS`

No legal/default duration is embedded in the application. Missing or invalid values fail validation.

The scheduled runner is additionally gated by:

- `TALKPOINT_RETENTION_AUTOMATION_ENABLED=true`

Do not enable the scheduler until privacy/legal owners have approved the actual values for the intended deployment.

## What the application deletes

The retention executor can:

1. delete expired ephemeral anonymous sessions using each session's existing `expiresAt`;
2. delete identifiable ContactRequests only when they are already `closed` and older than the configured ContactRequest cutoff;
3. retain the minimum ConsentRecord deletion evidence needed for deletion semantics and later remove eligible orphan consent records according to the separately configured consent cutoff;
4. delete eligible provider audit events after their configured cutoff;
5. delete eligible anonymous aggregate analytics after their configured cutoff.

Active ContactRequests are not automatically removed by the ContactRequest retention pass.

## User withdrawal

Production withdrawal uses:

- the opaque public request UUID returned by the production handoff; and
- the random management credential returned to that user.

The management credential is validated against its stored hash using constant-time comparison. Invalid credentials and unknown request UUIDs share the same generic error to reduce enumeration leakage.

A successful withdrawal transactionally:

- records withdrawal/deletion metadata on the associated consent record;
- removes the identifiable ContactRequest;
- preserves a minimal tombstone containing opaque identifiers/hashes needed for idempotent withdrawal and stale-retry protection.

The tombstone does not retain the user's contact details, name, free-text summary, anonymous-session content, safety content or AI content.

Repeated valid withdrawal is idempotent. A delayed exact production-handoff retry after deletion is rejected rather than recreating the deleted request.

## Important external boundaries

Application-level deletion does not by itself prove deletion from every infrastructure layer. Before real production release, deployment/privacy owners must define and validate, as applicable:

- PostgreSQL backup retention and restoration procedures;
- platform/database snapshots and replicas;
- infrastructure or reverse-proxy logs;
- observability/error-reporting retention;
- downstream provider copies created after an authorised handoff;
- legal-hold or statutory exceptions, if applicable;
- incident/audit preservation requirements.

Those controls must not be invented in repository documentation.

## Verification

CI covers static retention invariants and live PostgreSQL persistence/deletion behaviour, including wrong-credential rejection, opaque IDs, idempotent withdrawal, stale-retry blocking, active-request preservation and independent retention paths.

Green CI is engineering evidence only. It is not legal/privacy approval of the configured durations.
