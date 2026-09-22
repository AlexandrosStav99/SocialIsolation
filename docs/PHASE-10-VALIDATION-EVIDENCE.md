# Phase 10 - Verification & Academic Validation Evidence

## Automated evidence

The cumulative CI is the reproducible engineering evidence chain. It covers dependency security, zero-warning lint, TypeScript, build, privacy/data boundaries, directory validation, deterministic conversation, routing/safety structural rules, AI authority/fallback boundaries, consent/handoff, RBAC/organisation isolation, privacy-safe analytics, Payload/PostgreSQL runtime and migrations, accessibility regressions and production Playwright regressions.

Phase 10 explicitly protects:

- routing implementation and no-match recovery;
- organisation-scoped queue access;
- privacy-safe logging and withdrawal/deletion contract;
- raw OpenAI Responses API output parsing;
- unresolved human validation gates;
- truthful separation between implemented runtime evidence and production-operational validation.

## Current validation map

The authoritative validation-status summary is `VALIDATION-EVIDENCE-MATRIX.md`.

Current high-level position:

- end-to-end controlled implementation: automated evidence present;
- deterministic routing: automated evidence present;
- privacy/security architecture: substantial automated evidence present, final legal/privacy validation still open;
- manual accessibility: **NOT COMPLETE**;
- safety/domain review: **NOT COMPLETE**;
- target-user evaluation with adults aged 18–30: **NOT COMPLETE**;
- final academic closure: **NOT COMPLETE**.

No repository document should convert those external gates into “passed” status without real evidence.

## Human/external validation package

Use these controlled evidence-capture documents:

- `MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md` for manual accessibility execution;
- `UX-5-USABILITY-TEST-PLAN.md` for study method;
- `USABILITY-SESSION-RECORD-TEMPLATE.md` for individual target-user sessions;
- `SAFETY-CONTENT-VALIDATION-CHECKLIST.md` for qualified safeguarding/domain review;
- `PRIVACY-LEGAL-VALIDATION-CHECKLIST.md` for authorised legal/privacy review;
- `PROVIDER-VALIDATION-CHECKLIST.md` for real directory/provider-pilot evidence;
- `ACADEMIC-CLOSURE-TEMPLATE.md` for the final report/viva evidence chain.

## Research integrity

For target-user sessions record only necessary non-sensitive research evidence such as participant code, age-band confirmation, device/language, task outcome, observed usability issue, severity, correction decision and retest result.

Do not place real support disclosures or contact details in the repository. Do not invent participant quotes, completion percentages or study outcomes.

For domain/legal/provider review, record reviewer role/authority, review date, version/scope reviewed, findings, required correction, implementation reference and sign-off status. Do not self-approve a gate that requires external expertise.

## Material corrections

Any critical functional, safety, privacy/security, accessibility or validation failure discovered by real validation must be:

1. documented against the relevant evidence record;
2. assessed against the frozen scope rule;
3. corrected on a dedicated branch if a code/content change is required;
4. rerun through full cumulative CI;
5. retested in the relevant human/domain scenario where necessary.

## Completion rule

The academic Definition of Done remains **NOT COMPLETE** until the remaining external gates are actually executed and the final evaluation supports each clause of the frozen Definition of Done.

Green CI proves tested implementation properties. It does not by itself prove WCAG conformance, legal compliance, real-world safety suitability, provider partnership or target-user usability.
