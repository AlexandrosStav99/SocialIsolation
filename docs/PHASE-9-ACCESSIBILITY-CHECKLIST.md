# Phase 9 Accessibility & Bilingual QA

Target baseline: WCAG 2.2 AA. This is a target, not a compliance certification.

## Automated / CI
- Keyboard operation of the demo input and send action.
- Focus visibility remains browser/Tailwind-visible.
- Conversation log exposes live polite updates.
- Mobile 375px horizontal-overflow regression check.
- EL/EN content contract parity check.
- Existing production regression suite remains mandatory.

## Manual review checklist
- [ ] Navigate all interactive controls using keyboard only.
- [ ] Confirm visible focus indicator on links, buttons and fields.
- [ ] Check headings and landmark order.
- [ ] Check form labels and instructions in both EL and EN.
- [ ] Check status updates with VoiceOver/NVDA.
- [ ] Check 200% zoom and text reflow.
- [ ] Check contrast of text, controls and focus indicators against WCAG 2.2 AA criteria.
- [ ] Check mobile layouts at representative narrow widths.
- [ ] Check error, empty, loading and no-match copy in both languages.

Manual items are deliberately not marked complete by CI. No WCAG compliance claim may be made without completing and documenting the manual audit.
