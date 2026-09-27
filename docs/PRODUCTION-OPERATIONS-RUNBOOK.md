# TalkPoint Production Operations Runbook

Status: **application observability contract implemented; external monitoring, backup infrastructure and incident ownership are not provisioned in-repo**.

This runbook records the PROD-7 operational boundary. It does not claim that a hosting platform, alerting service, backup service, on-call rota or incident-response organisation has been selected.

## Health endpoints

### `GET /api/health/live`

Purpose: process-level liveness.

Successful response:

```json
{"status":"ok"}
```

The liveness endpoint deliberately does not query PostgreSQL. A database outage should not automatically cause an orchestrator to restart otherwise healthy application processes.

### `GET /api/health/ready`

Purpose: dependency readiness.

The readiness check validates the active runtime configuration and verifies PostgreSQL access to critical migrated application tables, including the identifiable-request and shared rate-limit boundaries.

Successful response:

```json
{"status":"ready"}
```

A dependency/configuration failure returns HTTP 503 with only:

```json
{"status":"not_ready"}
```

The public response does not expose connection strings, exception messages, table details, stack traces, provider data or user data.

Both endpoints are non-cacheable.

## Monitoring contract

A real production deployment should use the health endpoints from its selected platform or monitoring service.

The repository does not invent polling intervals, alert thresholds, escalation contacts or availability SLOs. Those values must be selected by the actual operations owner against the real infrastructure and service commitments.

At minimum, production monitoring should distinguish:

- application process unavailable;
- application not ready because a required dependency is unavailable;
- repeated shared rate-limit store failures;
- retention automation failure;
- elevated server-side API failures.

## Privacy-safe operational logging

Operational logs use structured JSON events with a strict metadata allowlist.

Allowed metadata is limited to operational state such as component, status, error code, HTTP status and aggregate deletion counts. The operational logger does not accept request IDs, provider IDs, names, contact details, emails, phone numbers, free text, prompts, AI content or structured support summaries.

Current operational events include:

- `readiness_check_failed`;
- `api_boundary_failure`;
- `api_rate_limit_event`;
- `retention_run_complete`;
- `retention_run_failed`.

Raw exception messages are intentionally not emitted by the retention scheduler because infrastructure/library errors can contain sensitive configuration detail.

The deployment owner must define log destination, access control and retention under the final privacy/security review. Application logs must not be repurposed as behavioural analytics.

## Incident response

When a production incident is detected:

1. determine whether the issue is process availability, dependency readiness, abuse/security controls, data integrity or an external provider/deployment problem;
2. preserve privacy-safe operational evidence needed to investigate the incident;
3. avoid copying identifiable ContactRequest content into tickets, chat systems or logs unless an approved incident process explicitly requires and protects it;
4. fail closed on assisted handoff, withdrawal or provider access when a required security/dependency boundary cannot be trusted;
5. rotate affected application secrets or credentials when compromise is suspected, using the deployment secret-management process;
6. assess whether any provider/user notification or legal reporting obligation exists with the authorised privacy/security owner;
7. record the root cause, containment, corrective action and verification evidence;
8. run the relevant regression/CI checks before returning a corrected build to service.

No repository document names an incident commander, legal contact or notification deadline because those require the real operating organisation and jurisdiction-specific approval.

## Backup and restore expectations

The application repository does not create or claim production database backups.

Before production release, the selected PostgreSQL/platform owner must document and test:

- automated backup/snapshot mechanism;
- encryption at rest and in transit for backup material;
- access controls and auditability;
- backup retention aligned with the approved privacy/legal retention model;
- treatment of deleted identifiable requests in retained backups;
- restore procedure into an isolated environment;
- integrity verification after restore;
- secret/key availability needed to restore encrypted application data;
- deletion/expiry behaviour after restoration;
- a repeatable restore drill with recorded evidence.

### RPO and RTO

Recovery Point Objective (RPO) and Recovery Time Objective (RTO) are **not defined by the repository**. They are operational/business decisions that must be approved against the real hosting design and service commitments.

Do not invent RPO/RTO values merely to close PROD-7.

## Retention scheduler operations

The retention scheduler remains separately gated by `TALKPOINT_RETENTION_AUTOMATION_ENABLED=true` and the approved retention configuration.

A successful run emits aggregate deletion counts only. A failed run exits non-zero and emits a privacy-safe `retention_run_failed` event without the raw exception message.

The deployment scheduler must surface non-zero execution as an operational failure.

## Dependency outages

### PostgreSQL unavailable

Expected behaviour:

- readiness becomes HTTP 503;
- DB-backed production API boundaries fail closed;
- liveness may remain HTTP 200 while the process itself is healthy.

### Shared rate-limit store unavailable

The shared limiter uses PostgreSQL. Protected production routes already fail closed rather than bypassing abuse protection.

### External AI unavailable

The frozen product architecture uses deterministic fallback. AI failure must not control provider selection or safety routing.

## Release boundary

PROD-7 provides repository-level observability and operations mechanics. It does not prove:

- external monitoring is connected;
- alerts reach a real on-call owner;
- backups exist;
- a restore drill has succeeded;
- incident roles are staffed;
- production RPO/RTO are approved;
- log retention is legally approved.

Those remain deployment/privacy/operations evidence gates and must be recorded only when real evidence exists.
