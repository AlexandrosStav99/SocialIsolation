# UX-5 Target-User Usability Test Plan

Status: planned validation only. No participant sessions or findings are claimed in this document.

## Purpose

Evaluate whether the final TalkPoint university MVP is understandable, calm, privacy-comprehensible and usable by target adults aged 18–30 without external explanation.

## Participants

Target approximately 5–8 participants aged 18–30. Recruit a mix of participants with different levels of digital confidence where feasible. Do not recruit or screen participants based on sensitive support needs merely to make the prototype test more realistic.

## Test environment

Use the university demonstration with synthetic/demo services. State clearly before testing that TalkPoint is not therapy, diagnosis, emergency support or a live provider service and that no real contact request is sent.

Where practical, include both desktop and mobile sessions. Participants may use English or Greek according to preference.

## Core tasks

1. From the homepage, explain in the participant's own words what TalkPoint does and whether an account is required.
2. Start the check-in and navigate to service results using a scenario supplied by the moderator.
3. Review the routing summary and correct one previously selected item without restarting.
4. Explain why a displayed service appears and identify whether TalkPoint is claiming it is clinically appropriate or a guaranteed match.
5. Follow a no-exact-match scenario and choose a recovery path without losing the original context.
6. Open the assisted-handoff Sharing Preview and explain what would be shared, what would not be shared and with whom.
7. Cancel the handoff and confirm that service exploration remains available.
8. Locate the immediate-support control and explain what capability the participant believes it provides.
9. On mobile, open/close navigation and complete a meaningful part of the check-in/results flow.

## Moderator prompts

Use neutral prompts such as:

- “What do you think will happen if you choose this?”
- “What information do you think TalkPoint knows about you at this point?”
- “Why do you think this service is being shown?”
- “What would you do next if none of these options felt right?”
- “What do you think will be shared if you confirm this?”

Avoid teaching the interface or revealing the expected answer before the participant responds.

## Evidence to capture

Use `USABILITY-SESSION-RECORD-TEMPLATE.md` for each real participant.

For each participant, record:

- task completion or abandonment;
- major navigation errors or loops;
- incorrect mental models about anonymity, matching, consent, safety or demo status;
- points of hesitation/confusion;
- whether the participant can explain the service-match reason accurately;
- whether the participant understands no-match recovery;
- whether the participant correctly distinguishes anonymous exploration from provider-specific handoff;
- whether the participant notices and understands demo/synthetic-data disclosures;
- accessibility or mobile usability issues observed;
- participant quotes only when consent for research notes allows it.

Do not record unnecessary sensitive personal disclosures.

## Success criteria

The study should look for evidence that most participants can, without moderator correction:

- identify TalkPoint as support navigation rather than therapy/diagnosis;
- begin and complete the guided check-in;
- understand why service options are shown;
- recover from no exact match;
- correct routing choices without restarting;
- understand the anonymous-to-identifiable boundary and Sharing Preview;
- recognise that the environment is a university demonstration and no real request is sent;
- find the immediate-support route without assuming TalkPoint itself is an emergency service.

These are evaluation goals, not pre-declared proof of usability.

## Issue severity

Classify observed issues after sessions:

- **Critical:** creates a material safety/privacy misunderstanding, blocks the core journey or could cause unintended disclosure/action.
- **High:** repeatedly prevents task completion or creates a major false mental model.
- **Medium:** causes significant hesitation, recoverable error or unclear next action.
- **Low:** polish/readability issue with limited effect on completion or comprehension.

Critical and high findings should be reviewed before calling target-user validation complete.

## Reporting

After actual sessions, produce a separate findings report containing participant count, recruitment/method, task outcomes, observed issues, prioritisation, changes made, retest evidence and unresolved limitations. `ACADEMIC-CLOSURE-TEMPLATE.md` defines how those real findings feed the final evidence chain.

Do not backfill or invent findings, success rates or quotes if sessions have not occurred.
