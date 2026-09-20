# Phase 10 - Verification & Academic Validation Evidence

## Automated evidence
The cumulative CI is the reproducible engineering evidence chain. It covers lint/type/build, dependency audit, privacy/data boundaries, directory validation, deterministic conversation, routing/safety structural rules, AI authority/fallback boundaries, consent/handoff, RBAC/organisation isolation, privacy-safe analytics, accessibility regressions and production Playwright regressions.

Phase 10 adds explicit checks for:
- routing implementation and no-match recovery;
- organisation-scoped queue access;
- privacy-safe logging and withdrawal/deletion contract;
- raw OpenAI Responses API output parsing;
- presence of unresolved human validation gates.

## Human validation gates - NOT COMPLETE
These cannot honestly be completed by repository code or CI:
1. Domain-expert review of safety trigger wording/rules and immediate-support resources.
2. Target-user usability study with adults aged 18–30.
3. Manual accessibility audit items recorded in Phase 9.
4. Legal/privacy/domain review before any real Cyprus deployment.

Until evidence from the first two is recorded, the academic Definition of Done is **not fully satisfied**. The repository must not describe those gates as passed.

## Study evidence template
For each target-user session record only non-sensitive research evidence: participant code, age-band confirmation (18–30), scenario/tasks, completion observations, usability issues, severity, correction decision and retest result. Do not place real support disclosures or contact details in the repository.

## Domain-expert evidence template
Record reviewer role/qualification, review date, version reviewed, each safety wording/rule/resource finding, required correction, implementation reference and sign-off status. Do not mark safety wording clinically validated without this evidence.

## Material corrections
Any critical functional, safety, privacy/security, accessibility or validation failure discovered by either study must be fixed and rerun through cumulative CI before final academic sign-off.
