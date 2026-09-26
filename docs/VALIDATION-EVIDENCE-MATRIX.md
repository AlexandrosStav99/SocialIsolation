# TalkPoint Validation Evidence Matrix

Status: **validation execution in progress**. The UX implementation programme is complete, but the frozen MVP Definition of Done is not fully satisfied until the remaining human/domain validation gates have real evidence.

This matrix maps section 23 of `TALKPOINT-MVP-SPEC.md` to the evidence currently available and the evidence still required. It must not be used to imply that external validation has happened when it has not.

## Status vocabulary

- **IMPLEMENTED / AUTOMATED EVIDENCE PRESENT**: reproducible repository/CI evidence exists for the controlled university demonstration.
- **PARTIAL EVIDENCE**: relevant evidence exists, but the gate still needs human, academic or operational confirmation.
- **NOT COMPLETE**: required external evidence has not yet been produced.

## Validation gates

| # | Frozen-spec gate | Current status | Evidence already present | Evidence still required |
| --- | --- | --- | --- | --- |
| 1 | Problem validation | **PARTIAL EVIDENCE** | Frozen MVP spec, Phase 0 review, Product & UX Contract, implementation/architecture reviews and documented scope/trade-offs create a traceable requirement chain. | Final academic synthesis must connect the original research/problem evidence to the implemented requirements and explicitly identify assumptions that were not validated. |
| 2 | End-to-end validation | **IMPLEMENTED / AUTOMATED EVIDENCE PRESENT** | CI covers the controlled flow from age gate through guided check-in, deterministic discovery, Sharing Preview, explicit demo consent and provider-queue workflow boundaries. Production build and Playwright regressions are mandatory. | Manual exploratory confirmation may supplement CI, but no additional code feature is required unless a concrete defect is found. |
| 3 | Routing validation | **IMPLEMENTED / AUTOMATED EVIDENCE PRESENT** | Deterministic discovery, no-match recovery, explainability and representative routing scenarios are version controlled and tested. The LLM does not choose providers. | If real directory data is introduced, representative real-data scenarios must be rerun against that checked dataset. |
| 4 | Safety validation | **NOT COMPLETE** | Safety routing is constrained and tested as navigation, not clinical assessment. Production-invalid claims/resources are blocked by documentation and CI boundaries. | Qualified safeguarding/domain expert must review the trigger matrix, exact EN/EL wording and any real Cyprus immediate-support resources using `SAFETY-CONTENT-VALIDATION-CHECKLIST.md`. |
| 5 | Privacy/security validation | **PARTIAL EVIDENCE** | Four-domain architecture, logging redaction, consent separation, clean migrations and PostgreSQL round-trip are CI-verified. PROD-3 adds runtime evidence for authenticated provider sessions, manager organisation scope, staff assigned-only access, cross-organisation denial, same-organisation assignee validation, transactional workflow/audit persistence and session invalidation after deactivation. | Final legal/privacy review, production retention duration, data-subject procedures, controller/processor roles, lawful-basis assessment and real deployment security/operational controls remain external. |
| 6 | Target-user validation | **NOT COMPLETE** | A structured usability plan exists for approximately 5–8 adults aged 18–30, with explicit task and evidence criteria. | Real sessions must be run, findings recorded, material issues prioritised, critical/high issues corrected and relevant tasks retested. No success rates or quotes may be invented. |
| 7 | Academic evaluation | **NOT COMPLETE** | Engineering evidence, phase reviews, limitations and validation templates exist. | Final report must integrate actual user/domain/accessibility/legal findings, implementation outcomes, failed assumptions, trade-offs, changes made and unresolved limitations. |

## Manual accessibility evidence

Automated accessibility regressions are **not** formal WCAG conformance evidence. Manual validation remains open and should be executed using `MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md` together with `PHASE-9-ACCESSIBILITY-CHECKLIST.md`.

## Production-readiness boundaries

The following remain intentionally unresolved or environment-specific and must not be silently converted into “passed” status:

- final safety trigger matrix and real immediate-support content;
- final legal/privacy wording and lawful-basis assessment;
- exact production retention duration;
- complete checked Cyprus service dataset and its revalidation process;
- production identity/MFA/onboarding and infrastructure/incident-response controls;
- requirements and agreements for any real-provider pilot;
- real target-user findings;
- formal accessibility conformance assessment, if one is required.

## Claim boundary

The current evidence supports this statement:

> The controlled university implementation is technically complete for the frozen coded scope and has reproducible automated evidence for its critical architecture and core journey.

It does **not** yet support this statement:

> TalkPoint MVP v1.0 has fully satisfied the frozen Definition of Done or is production-ready.

That stronger claim becomes defensible only after the remaining external validation gates are actually completed and their evidence is recorded.
