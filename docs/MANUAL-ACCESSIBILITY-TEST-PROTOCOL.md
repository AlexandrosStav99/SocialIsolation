# TalkPoint Manual Accessibility Test Protocol

Status: **protocol only**. No manual accessibility result is claimed until a named test run is completed and recorded.

Purpose: execute the manual checks required by the frozen MVP specification and `PHASE-9-ACCESSIBILITY-CHECKLIST.md` without confusing automated browser evidence with WCAG conformance.

## Test record header

For every run record:

- tester / reviewer role;
- date;
- commit SHA / deployed build identifier;
- browser and version;
- operating system;
- device type;
- assistive technology and version where applicable;
- language tested: EN / EL;
- result: Pass / Fail / Blocked / Not applicable;
- evidence reference: notes, screenshot, recording or issue/PR number where appropriate.

Do not record unnecessary sensitive user information.

## A11Y-01 Keyboard-only complete journey

Using no mouse or touch input:

1. Navigate the homepage and primary navigation.
2. Start the check-in.
3. Complete the age gate and structured choices.
4. Use Back and language switching.
5. Edit a routing selection from Review.
6. Reach results and inspect service detail.
7. Exercise no-match recovery.
8. Open and cancel the Sharing Preview.
9. Reach explicit consent without submitting it accidentally.
10. Open and dismiss the immediate-support notice.

Verify:

- logical focus order;
- all interactive controls are reachable;
- visible focus is consistently distinguishable;
- no focus enters visually hidden content;
- no keyboard trap occurs;
- Escape behaviour works for the mobile menu where relevant;
- focus return is sensible after dismissing temporary UI.

## A11Y-02 Screen-reader desktop journey

Use at least one appropriate desktop screen reader, for example NVDA with a supported Windows browser or VoiceOver on macOS.

Verify:

- document title and language are announced appropriately;
- landmarks/headings give a sensible page outline;
- age gate and check-in choices expose useful roles/names/states;
- checkbox state and selected state are understandable;
- progress information is not misleading;
- status/error messages are announced;
- Sharing Preview structure, recipient, shared/not-shared sections and consent are understandable;
- no-match recovery is understandable without visual context;
- immediate-support notice is announced without implying a monitored emergency service.

Run critical states in both EN and EL where the screen reader supports the language adequately. Record any language-specific limitation honestly.

## A11Y-03 Screen-reader mobile journey

Use at least one mobile screen reader, for example VoiceOver on iOS or TalkBack on Android.

Verify:

- mobile navigation toggle announces expanded/collapsed state;
- navigation order remains understandable;
- check-in choice controls and buttons are reachable with swipe navigation;
- focus does not jump unpredictably after state transitions;
- Sharing Preview and consent are operable;
- error/status announcements are understandable;
- touch targets are practically usable on a physical device.

## A11Y-04 Zoom and reflow

Test representative public and check-in states at:

- 200% browser zoom;
- 400% zoom/reflow where applicable to the chosen viewport.

Include:

- homepage hero/navigation;
- one check-in choice screen;
- Review;
- exact-match results;
- no-match recovery;
- Sharing Preview;
- recoverable handoff error.

Verify no essential content/action is clipped, overlapped, lost or requires two-dimensional scrolling except where inherently necessary.

## A11Y-05 Contrast and non-colour cues

Manually inspect final rendered states, not only source tokens.

Verify:

- normal text contrast;
- large text contrast where applicable;
- focus indicator visibility;
- disabled/busy controls remain understandable;
- error/status meaning is not conveyed by colour alone;
- selected choices use more than colour alone;
- decorative low-contrast elements do not carry essential information.

Use a recognised contrast measurement tool for any borderline combination and record the measured colours/ratio.

## A11Y-06 Motion and reduced motion

With OS/browser reduced-motion preference enabled:

- verify smooth scrolling is suppressed;
- verify transitions/animation do not create unnecessary motion;
- verify no content becomes unavailable because motion is reduced.

Also perform a qualitative motion review in normal mode for distracting or vestibularly problematic effects.

## A11Y-07 Error, loading and status announcements

Exercise:

- handoff in-progress state;
- simulated network/server failure;
- successful demo completion;
- no-match state;
- immediate-support notice.

Verify assistive technology receives useful status changes and that retry/cancel paths remain available.

## A11Y-08 Physical mobile ergonomics

On at least one representative narrow physical device:

- complete a meaningful portion of the check-in;
- open navigation;
- inspect results;
- open Sharing Preview;
- interact with checkbox and primary/secondary actions.

Record clipping, accidental taps, difficult targets, keyboard viewport issues and scrolling problems.

## Finding severity

- **Critical:** prevents core completion or creates a material safety/privacy/consent misunderstanding.
- **High:** major accessibility blocker with no reasonable workaround.
- **Medium:** significant friction/confusion but task remains achievable.
- **Low:** limited polish/readability issue.

Critical and High findings must be corrected or explicitly accepted with documented rationale before manual accessibility validation can be called complete.

## Completion rule

Do not mark the manual accessibility gate complete until:

- required runs above have evidence;
- failures have issue/PR references and disposition;
- critical/high fixes have been retested;
- remaining limitations are documented;
- no statement exceeds the actual evidence.

Completion of this protocol still does not automatically constitute a formal WCAG certification.
