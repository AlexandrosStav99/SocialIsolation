# UX-5 Validation Status

Status: implementation evidence for the university MVP. This document is not a WCAG compliance certification and does not claim completed target-user validation.

## Automated evidence in CI

The repository CI verifies dependency security, zero-warning lint, TypeScript, Phase 1–10 invariant checks, Payload/PostgreSQL runtime behaviour, privacy-domain persistence, provider/consent hardening, committed migration application, live PostgreSQL round-trip, production build and Playwright browser regressions.

UX-5 browser coverage adds evidence for:

- mobile navigation semantics and Escape-to-close with focus return;
- 375px homepage and check-in/result/sharing-preview flows without horizontal overflow;
- document language tracking when the check-in changes between English and Greek;
- reduced-motion CSS behaviour when `prefers-reduced-motion: reduce` is active;
- handoff submission progress, duplicate-submit prevention, recoverable failure behaviour and successful-preview reset;
- continued EN/EL, privacy, consent, safety, deterministic routing and no-match regressions.

## Static implementation review completed in UX-5

The UX-5 implementation also reviews and corrects known issues identified in the handoff:

- desktop navigation is persistently visible instead of visually hidden while remaining keyboard-focusable;
- mobile navigation exposes expanded/control relationships and supports Escape with focus return;
- explicit focus-visible treatment is used on critical navigation/CTA/footer controls;
- page landmarks keep header/navigation and footer outside the main content landmark;
- known normal-text contrast failures are corrected with minimal token/component changes rather than a visual redesign;
- the integrated check-in synchronises the document `lang` value with the selected language;
- assisted-demo handoff has an explicit busy state, duplicate-submit protection, recoverable error feedback and no stale successful consent preview.

## Manual accessibility checks still required

These items remain manual validation tasks and must not be inferred from automated tests:

- screen-reader journey review with at least one desktop and one mobile screen reader;
- keyboard-only review of the complete public journey, including focus order and focus visibility in all states;
- zoom/reflow checks at 200% and 400% where applicable;
- manual contrast review for all final states and browser-rendered text/icon combinations;
- target-size and touch ergonomics review on physical mobile devices;
- motion/vestibular review beyond the automated reduced-motion assertion;
- error-message comprehension and announcement behaviour with assistive technology;
- full WCAG 2.2 AA conformance assessment by an appropriately qualified reviewer if a formal compliance claim is ever required.

## Target-user validation still required

No usability findings are claimed here. The structured plan is in `docs/UX-5-USABILITY-TEST-PLAN.md`. Sessions must actually be run with target participants before findings, success rates or design conclusions are reported.

## Release boundary

The university demonstration remains subject to the frozen MVP limitations, the Product & UX Contract and `docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md`. Real Cyprus immediate-support content, final legal/privacy wording, real-provider operation and formal accessibility compliance remain outside the evidence established by this UX-5 implementation.
