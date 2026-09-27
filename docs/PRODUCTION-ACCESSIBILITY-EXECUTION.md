# TalkPoint Accessibility Execution Readiness

Status: **execution support implemented; manual accessibility validation remains not complete**.

PROD-9 prepares the controlled TalkPoint implementation for repeatable accessibility validation without claiming that a human accessibility review has occurred.

## Automated evidence

Repository CI already exercises:

- keyboard activation of critical check-in controls;
- mobile navigation expanded/collapsed semantics and Escape focus return;
- explicit focus-visible implementation boundaries;
- EN/EL document-language switching;
- 375px critical-flow overflow regressions;
- reduced-motion behaviour;
- recoverable handoff status/error states;
- deterministic no-match and Sharing Preview states.

PROD-9 additionally protects the keyboard bypass path:

- the shared public navigation exposes a keyboard-visible `Skip to main content` link;
- homepage, About and check-in expose one stable `#main-content` target;
- automated regression verifies that the skip link is the first keyboard stop and transfers focus to the main target.

Run the focused browser evidence with:

```sh
npx playwright test tests/accessibility.spec.ts tests/ux5.spec.ts
```

Automated evidence does **not** establish screen-reader comprehension, practical physical-device ergonomics, final rendered contrast, qualitative motion comfort or WCAG conformance.

## Manual execution package

Use these files together:

1. `docs/MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md` for A11Y-01 through A11Y-08.
2. `docs/ACCESSIBILITY-MANUAL-RUN-RECORD.md` as the blank evidence record for each real run.
3. `docs/PHASE-9-ACCESSIBILITY-CHECKLIST.md` as the gate checklist.
4. `docs/UX-5-VALIDATION-STATUS.md` for the current automated/manual claim boundary.

Create a copy of the run-record template per tester/environment rather than editing the blank template into a fictional aggregate result.

## Suggested execution matrix

The protocol, not this matrix, is authoritative. A practical minimum execution set is:

| Area | Required real execution |
| --- | --- |
| Keyboard-only | Complete critical public/check-in journey without mouse/touch |
| Desktop screen reader | At least one appropriate desktop screen reader/browser combination |
| Mobile screen reader | At least one physical mobile device with VoiceOver or TalkBack |
| Zoom/reflow | 200% and 400% where applicable |
| Contrast | Final rendered-state measurement for borderline combinations |
| Motion | Reduced-motion plus qualitative normal-motion review |
| Status/error announcements | Loading, error, success, no-match, safety notice and Sharing Preview |
| Mobile ergonomics | Physical narrow device, touch/keyboard viewport interaction |

Record actual browser, OS, device and assistive-technology versions. Do not substitute generic labels such as “screen reader tested”.

## Finding workflow

For every failure:

1. assign a finding ID;
2. record the exact route/state and reproduction steps;
3. assign Critical, High, Medium or Low severity using the manual protocol;
4. create an issue/PR for material corrections;
5. link the fix;
6. retest Critical/High findings;
7. record the retest evidence in the same run record or an explicitly linked follow-up record.

Critical/High findings must be corrected or explicitly dispositioned with rationale before the manual accessibility gate can be called complete.

## CI integrity guard

`npm run test:production-accessibility-readiness` protects the evidence boundary. It verifies that:

- the manual protocol still states that it is protocol-only;
- the manual checklist is not silently committed as completed;
- the blank evidence template contains all A11Y-01 through A11Y-08 sections and required evidence fields;
- the skip-link/target implementation and browser regression remain present;
- repository docs do not convert automated evidence into a WCAG certification claim.

This guard proves evidence hygiene only. It cannot perform a human accessibility review.

## Claim boundary

After PROD-9 it is defensible to say:

> TalkPoint has CI-protected accessibility implementation evidence and a repeatable manual accessibility execution/evidence package.

It is **not** defensible to say:

> TalkPoint has passed manual accessibility testing, is WCAG 2.2 AA conformant, or has been validated with screen readers and physical devices.

Those stronger claims require real recorded human evidence.
