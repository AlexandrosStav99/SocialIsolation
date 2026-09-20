# Phase 3 Review — Deterministic Conversation Engine

## Goal

Implement the frozen adaptive check-in as deterministic application logic. The engine must work without AI and must not become a clinical assessment.

## Implemented

- Explicit 18+ confirmation gate. No date of birth.
- One-stage-at-a-time deterministic state machine.
- Primary support topic plus up to two distinct secondary topics.
- Optional bounded context after topic selection, maximum 500 characters.
- Greek and English privacy warning before optional free text.
- Service-area selection.
- Optional support preferences.
- Review and completion states.
- Explicit session termination.
- Structured summary that excludes optional free text.
- Raw optional context cleared when the deterministic flow completes or ends.
- Invalid/out-of-order actions fail closed rather than silently advancing.
- Phase 3 CI invariants.

## Boundaries

This engine does not diagnose, assess clinical risk, rank providers or make safety decisions. Safety Routing is Phase 4 and must remain deterministic. AI assistance is Phase 5 and cannot become the authority for routing or safety.

The engine contains no contact details and creates no contact request. Assisted handoff remains Phase 6.

## UX contract

The UI should render one prompt at a time and use progressive disclosure. The engine intentionally exposes state and prompt contracts rather than embedding a questionnaire page.

## Privacy

Optional free text is ephemeral session context. It is not included in the structured completion summary and is explicitly cleared at completion/end. Persistent storage and expiry continue to follow the Phase 1 ephemeral-session boundary.

## Exit assessment

Phase 3 is complete when the deterministic engine, bilingual prompts and invariants pass lint, TypeScript, build, prior-phase checks and regression tests on the final PR head.
