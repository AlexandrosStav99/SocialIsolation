# Phase 9 Accessibility & Bilingual QA

Target baseline: WCAG 2.2 AA. This is a target, not a compliance certification.

## Automated / CI

- Keyboard operation of critical demo controls is regression-tested.
- Explicit focus-visible treatment is implemented across critical public/check-in controls.
- Conversation/status regions expose polite updates where appropriate.
- 375px homepage and check-in/results/Sharing Preview overflow regressions are covered.
- EL/EN critical journey and document-language switching are covered.
- Reduced-motion behaviour is regression-tested.
- Handoff busy/failure/retry states are regression-tested.
- Existing production regression suite remains mandatory.

## Manual review checklist

Execute and record these using `MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md`:

- [ ] Navigate the complete public/check-in journey using keyboard only.
- [ ] Confirm visible focus indicator on links, buttons and fields in all critical states.
- [ ] Check headings and landmark order with assistive technology.
- [ ] Check form labels, instructions and control states in both EL and EN.
- [ ] Check status/error updates with at least one desktop screen reader.
- [ ] Check a representative mobile journey with a mobile screen reader.
- [ ] Check 200% zoom and 400% reflow where applicable.
- [ ] Check final rendered contrast of text, controls and focus indicators against the target criteria.
- [ ] Check physical-device touch targets and mobile ergonomics.
- [ ] Check motion/vestibular experience beyond the automated reduced-motion assertion.
- [ ] Check error, empty, loading, no-match, safety-notice and Sharing Preview states with assistive technology.

Manual items are deliberately not marked complete by CI. No WCAG compliance claim may be made merely because automated checks pass.

## Evidence rule

Each completed manual item should identify the build/commit, browser/device, assistive technology where relevant, result, findings and any correction/retest reference. Critical and high accessibility findings must be corrected or explicitly dispositioned before the manual accessibility gate can be called complete.
