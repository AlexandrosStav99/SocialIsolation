# TalkPoint Go-Live & University Completion Master Checklist

Status: **master execution checklist**  
Last reviewed: 2026-09-27  
Engineering baseline: PROD-1 through PROD-12 complete and CI-protected  
Claim boundary: **production engineering complete; external validation and deployment evidence remain open**

This is the operational checklist for closing the university MVP evidence chain and, separately, preparing TalkPoint for a defensible real-world production launch.

The two outcomes are related but not identical:

- **University completion** requires a defensible evidence chain for the frozen Definition of Done. It does not require pretending that a public production service exists.
- **Real production launch** additionally requires approved real-world safety, privacy/legal, provider, infrastructure and operations evidence.

Do not reopen product scope unless a real validation or deployment exercise exposes a concrete defect or an approved configuration/data change.

## 0. Current baseline

| Area | Status | Evidence / next rule |
| --- | --- | --- |
| Frozen coded MVP | DONE | Implemented and CI-protected |
| UX-0 through UX-5 | DONE | Merged |
| PROD-1 through PROD-12 | DONE | Final production engineering programme complete |
| PostgreSQL / Payload runtime | DONE | Migrations and live CI persistence checks exist |
| Automated end-to-end / routing evidence | DONE | CI-protected |
| Manual accessibility | OPEN | Real human/device runs required |
| Target-user usability | OPEN | Approximately 5-8 real participants required |
| Safety/domain validation | OPEN | Qualified reviewer required |
| Privacy/legal validation | OPEN | Authorised reviewer required |
| Real provider/directory validation | OPEN | Real records/ownership/agreements required only where applicable |
| Real production infrastructure | OPEN | Hosting/DNS/TLS/secrets/backups/monitoring evidence required for launch |
| Academic closure | OPEN | Must integrate the real evidence above |

Latest known green engineering evidence should be referenced from the current `main` / HANDOFF rather than copied into this file as a permanent claim.

---

# Track A - University Completion

## A1. Freeze the evaluated build

Status: **COMPLETE for RC1**. See `docs/VALIDATION-BASELINE-RC1.md`.

Owner: **Project owner / developer**

- [x] Select the exact commit/build that will be used for human validation: `dc8aeb6e4ef49a93605e7600e27376ca43b5f420`.
- [x] Confirm its CI evidence is green: PR #55 / CI #283 on the identical source tree.
- [x] Record commit SHA and CI run in the evidence pack.
- [x] Freeze branch `validation/2026-09-27-rc1` at the evaluated commit.
- [x] Define the controlled university `demo` runtime as the validation environment.
- [x] Preserve explicit synthetic-service labelling.
- [x] Confirm no real provider contact request will be sent during testing.
- [x] Freeze feature scope while validation is running unless a material defect is found.

Evidence to keep:

- commit SHA;
- CI run URL/number;
- date of validation freeze;
- deployed/local demo build identifier.

Completion rule: every later usability/accessibility/safety finding must reference a known build/version.

## A2. Manual accessibility execution

Owner: **Project owner + accessibility tester(s)**  
Source protocol: `docs/MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md`  
Record: `docs/ACCESSIBILITY-MANUAL-RUN-RECORD.md`

Execute and record all required items:

- [ ] A11Y-01 keyboard-only complete journey.
- [ ] A11Y-02 desktop screen reader.
- [ ] A11Y-03 mobile screen reader.
- [ ] A11Y-04 200% and 400% zoom/reflow.
- [ ] A11Y-05 contrast and non-colour cues.
- [ ] A11Y-06 reduced motion / motion review.
- [ ] A11Y-07 error, loading and status announcements.
- [ ] A11Y-08 physical mobile ergonomics.
- [ ] Run critical states in EN and EL where applicable.
- [ ] Record browser, OS, device and assistive-technology versions.
- [ ] Record findings with severity and evidence.
- [ ] Fix or formally disposition all Critical/High findings.
- [ ] Retest every Critical/High fix.
- [ ] Document residual limitations.

Evidence to keep:

- completed run record;
- screenshots/recordings where useful;
- issue/PR references for defects;
- retest evidence;
- final manual accessibility conclusion.

Do not claim formal WCAG certification unless a separate qualified process actually establishes it.

## A3. Target-user usability study

Owner: **Project owner / researcher**  
Plan: `docs/UX-5-USABILITY-TEST-PLAN.md`  
Per-session record: `docs/USABILITY-SESSION-RECORD-TEMPLATE.md`

Participants:

- [ ] Recruit approximately 5-8 adults aged 18-30.
- [ ] Avoid recruiting based on sensitive support needs.
- [ ] Use a mix of digital confidence where practical.
- [ ] Include desktop and mobile use where practical.
- [ ] Allow EN or EL according to participant preference.

For every session:

- [ ] Explain that this is a university demo.
- [ ] Explain that TalkPoint is not therapy, diagnosis or emergency response.
- [ ] Explain that synthetic/demo services are used.
- [ ] Explain that no real provider request is sent.
- [ ] Complete the planned core tasks without teaching the expected answer.
- [ ] Record completion/abandonment and major navigation errors.
- [ ] Record misunderstandings around anonymity, matching, consent, safety or demo status.
- [ ] Record hesitation/confusion.
- [ ] Record mobile/accessibility observations.
- [ ] Record quotes only where research-note consent permits.
- [ ] Do not record unnecessary sensitive disclosures.

After all sessions:

- [ ] Aggregate recurring findings.
- [ ] Assign Critical / High / Medium / Low severity.
- [ ] Correct Critical/High issues or document a defensible disposition.
- [ ] Retest material corrections.
- [ ] Produce a findings summary using only real evidence.
- [ ] Record sample/method limitations.

Evidence to keep:

- anonymised participant/session identifiers;
- completed session records;
- task outcome summary;
- issue severity/frequency table;
- PRs/fixes and retests;
- limitations.

No invented percentages, quotes, participant characteristics or success rates.

## A4. Qualified safety/domain review

Owner: **Qualified safeguarding/domain reviewer**  
Checklist: `docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md`

- [ ] Identify the qualified reviewer and authority/role.
- [ ] Record the exact build/spec/version reviewed.
- [ ] Review every structured safety trigger.
- [ ] Confirm triggers are not diagnosis or clinical risk scoring.
- [ ] Review the persistent immediate-support action.
- [ ] Review exact EN wording.
- [ ] Review exact EL wording.
- [ ] Confirm TalkPoint does not imply human/clinical monitoring.
- [ ] Confirm user agency remains intact.
- [ ] If real Cyprus resources are proposed, verify each from authoritative sources.
- [ ] Record source, eligibility, hours, languages, contact route and checked date for every real resource.
- [ ] Define next revalidation date/cadence.
- [ ] Record Approved / Approved with conditions / Changes required / Rejected.
- [ ] Implement and retest any required code/content changes.

Evidence to keep:

- reviewer identity/role;
- reviewed trigger matrix version;
- reviewed EN/EL copy;
- resource verification table if real resources are used;
- sign-off/decision;
- changes and retest evidence;
- unresolved risks and next review date.

Engineering must not self-approve this gate.

## A5. Privacy/security academic evidence

Owner: **Project owner + authorised privacy/legal reviewer where the frozen DoD requires professional review**  
Checklist: `docs/PRIVACY-LEGAL-VALIDATION-CHECKLIST.md`

For the academic evidence chain:

- [ ] Document the four-domain privacy architecture.
- [ ] Reference CI evidence for separation, RBAC, consent, logging and deletion boundaries.
- [ ] Explain what the technical controls prove.
- [ ] Explicitly state what they do not prove.
- [ ] Obtain the required authorised privacy/legal review if the final Definition of Done is to mark privacy/legal validation complete.
- [ ] Record the review outcome rather than inferring compliance.
- [ ] Document any unresolved legal/privacy items as limitations.

Do not claim GDPR compliance from CI or architecture alone.

## A6. Problem-validation synthesis

Owner: **Project owner**

- [ ] Restate the original problem and target population.
- [ ] Link the original research/evidence that motivated the project.
- [ ] Map each material product decision to evidence or a documented constraint.
- [ ] Identify assumptions that were supported.
- [ ] Identify assumptions that were weakened/contradicted.
- [ ] Identify assumptions that remain unvalidated.
- [ ] Explain why anonymous-first exploration was chosen.
- [ ] Explain why deterministic matching was retained.
- [ ] Explain why free text is bounded and optional.
- [ ] Explain why provider-specific Sharing Preview/consent exists.
- [ ] Explain why safety is navigation rather than clinical assessment.

Evidence to keep:

- source references;
- requirements traceability;
- final assumptions table.

## A7. Academic closure

Owner: **Project owner**  
Template: `docs/ACADEMIC-CLOSURE-TEMPLATE.md`

Complete only after real validation evidence exists:

- [ ] Problem/rationale section.
- [ ] Requirements traceability.
- [ ] Engineering implementation evidence.
- [ ] End-to-end/routing validation.
- [ ] Manual accessibility results.
- [ ] Target-user usability results.
- [ ] Safety/domain validation results.
- [ ] Privacy/legal validation results.
- [ ] Provider/directory evidence if applicable.
- [ ] Material findings and iteration log.
- [ ] Failures and negative evidence.
- [ ] Limitations.
- [ ] Frozen Definition-of-Done decision.
- [ ] Final viva evidence index.

Final frozen Definition of Done to evaluate:

> Problem validated -> solution justified -> complete product implemented -> routing verified -> safety reviewed -> privacy/security tested -> target users evaluated -> material findings incorporated -> limitations documented.

For every clause mark only:

- Supported by evidence;
- Partially supported;
- Not supported yet.

Do not call the full MVP DONE academically unless every material clause is supported.

---

# Track B - Real Production Launch

This track is additional to the university evidence chain. It must not be faked merely to strengthen the dissertation.

## B1. Real provider/directory ownership

Owner: **Operating organisation / authorised directory owner**  
Checklist: `docs/PROVIDER-VALIDATION-CHECKLIST.md`

For every real provider/service:

- [ ] Verify official organisation identity.
- [ ] Verify service information from an authoritative source.
- [ ] Record information checked date.
- [ ] Set a real next-recheck date/cadence.
- [ ] Assign an accountable owner for rechecks.
- [ ] Classify as Directory-only or Integrated/pilot.
- [ ] Suppress uncertain/stale records instead of guessing.
- [ ] Use PROD-10 verification/suppression/publication gates.
- [ ] Do not infer a partnership from public information.

For any Integrated/pilot provider additionally:

- [ ] Formal participation/agreement exists.
- [ ] Recipient organisation/users are authorised.
- [ ] Exact fields shared are agreed.
- [ ] Purpose and workflow are agreed.
- [ ] Withdrawal/deletion coordination is agreed.
- [ ] Security/access expectations are agreed.
- [ ] Incident/escalation contacts are agreed.
- [ ] Provider workspace has been tested with controlled data.
- [ ] Provider acceptance/sign-off is recorded.
- [ ] Only then consider `productionHandoffEnabled=true`.

## B2. Final production privacy/legal decisions

Owner: **Authorised privacy/legal reviewer + operating organisation**

- [ ] Identify controller(s) and processor/sub-processor roles.
- [ ] Approve purposes and lawful bases by data domain.
- [ ] Review exact EN/EL Sharing Preview and consent wording.
- [ ] Review final privacy notices.
- [ ] Approve exact retention periods for every data class.
- [ ] Define data-subject request procedures.
- [ ] Define withdrawal/deletion coordination.
- [ ] Review real vendors and transfer mechanisms.
- [ ] Decide whether a DPIA/formal risk assessment is required.
- [ ] Complete it if required.
- [ ] Record formal sign-off and conditions.
- [ ] Encode the approved package/version and matching runtime values through PROD-12 controls.

No legal conclusion may be invented by engineering.

## B3. Production safety activation

Owner: **Qualified safety reviewer + operating organisation**

- [ ] Complete the safety review in A4.
- [ ] Approve the exact real EN/EL content.
- [ ] Approve any real immediate-support resources.
- [ ] Record revalidation dates.
- [ ] Encode the approved version in the production safety configuration.
- [ ] Enable the separate operational safety flag only after approval exists.
- [ ] Confirm production preflight rejects stale/missing approval.

## B4. Production identity and provider access operations

Owner: **Operating organisation / infrastructure and security owner**

- [ ] Select and configure real auth-email/reset delivery.
- [ ] Decide and implement the approved MFA/external identity strategy where required.
- [ ] Define onboarding/offboarding ownership.
- [ ] Create only authorised provider users.
- [ ] Verify organisation assignments.
- [ ] Test session revocation after authority changes/deactivation.
- [ ] Record operational access-review cadence.

## B5. Infrastructure provisioning

Owner: **Infrastructure / deployment owner**  
Runbook: `docs/PRODUCTION-DEPLOYMENT-RUNBOOK.md`

Provision and record real evidence for:

- [ ] Production hosting.
- [ ] Production PostgreSQL.
- [ ] Canonical domain/DNS.
- [ ] TLS.
- [ ] Secret/configuration management.
- [ ] Trusted ingress/client-IP contract.
- [ ] Environment separation.
- [ ] Monitoring.
- [ ] Alert delivery.
- [ ] Backup system.
- [ ] Restore process.
- [ ] Incident ownership/on-call/escalation.
- [ ] Production log retention.
- [ ] Approved HSTS decision after real hostname/TLS topology is known.

Never commit production secrets.

## B6. Backup and restore evidence

Owner: **Infrastructure / database owner**

- [ ] Produce a real production-like backup.
- [ ] Restore it into a controlled target.
- [ ] Verify application/database consistency after restore.
- [ ] Record date, operator, environment, procedure and result.
- [ ] Record actual RPO/RTO expectations approved by the operating organisation.
- [ ] Confirm retention/deletion expectations account for backups.

A configured backup job is not the same as successful restore evidence.

## B7. Production deployment

Owner: **Deployment operator**

Before deployment:

- [ ] Freeze immutable release SHA.
- [ ] Confirm green CI for that SHA.
- [ ] Confirm external provider/safety/privacy gates required for the intended live capabilities.
- [ ] Confirm production secrets/configuration.
- [ ] Confirm backup/restore prerequisite.
- [ ] Confirm synthetic fallback is disabled.
- [ ] Confirm demo dashboard is disabled.

Deploy:

- [ ] Run committed database migrations once.
- [ ] Run `npm run deploy:preflight`.
- [ ] Deploy/start the application only if preflight passes.
- [ ] Run `npm run deploy:verify -- https://<approved-origin>`.
- [ ] Verify `/api/health/live`.
- [ ] Verify `/api/health/ready`.
- [ ] Confirm expected security/no-cache headers.
- [ ] Verify monitoring/alerts receive real signals.
- [ ] Exercise agreed smoke tests.
- [ ] Record the release SHA, migration set, environment, operator and result.

Do not automatically run down migrations during rollback.

## B8. Production smoke validation

Owner: **Project owner + operating organisation**

Using controlled test data:

- [ ] Anonymous exploration works without identity.
- [ ] Production directory exposes only verified/current published records.
- [ ] Stale/suppressed records fail closed.
- [ ] Safety content matches the approved version.
- [ ] Privacy notice/consent match the approved version.
- [ ] No-match recovery works.
- [ ] Sharing Preview shows exact intended fields/recipient.
- [ ] Directory-only services do not create provider handoffs.
- [ ] Integrated provider controlled test request reaches only the correct organisation, if live handoff is in approved scope.
- [ ] Withdrawal/deletion management flow works.
- [ ] Provider workspace isolation works.
- [ ] No raw sensitive content appears in operational logs.

Do not use real vulnerable-user data for launch smoke tests.

## B9. Go-live decision

Owner: **Operating organisation with relevant reviewers**

A public launch decision may be recorded only when the evidence required for the intended capabilities exists.

Minimum decision record:

- [ ] release SHA;
- [ ] CI result;
- [ ] safety sign-off;
- [ ] privacy/legal sign-off;
- [ ] retention decisions;
- [ ] provider/directory sign-off;
- [ ] accessibility evidence;
- [ ] infrastructure/deployment evidence;
- [ ] backup/restore evidence;
- [ ] monitoring/incident ownership;
- [ ] unresolved risks;
- [ ] explicit launch / conditional launch / no-launch decision.

Engineering readiness alone is not a launch decision.

---

# Defect workflow during validation

If any real exercise exposes a defect:

1. [ ] Record the finding and severity.
2. [ ] Reproduce it against the frozen validation build.
3. [ ] Decide whether it is a code defect, content/configuration defect or external-process issue.
4. [ ] Create a narrowly scoped branch/PR only when repository change is justified.
5. [ ] Run full CI.
6. [ ] Merge only after green CI.
7. [ ] Retest the original finding.
8. [ ] Update the evidence record.
9. [ ] Do not silently invalidate previous validation evidence; record the new build/version used for retest.

---

# Immediate next actions

These can start now without inventing external evidence:

1. [x] Freeze the build used for validation and record SHA/CI (`RC1-2026-09-27`).
2. [ ] Execute the manual accessibility protocol.
3. [ ] Recruit and run the 5-8 target-user usability sessions.
4. [ ] Identify a qualified safeguarding/domain reviewer.
5. [ ] Identify the authorised privacy/legal reviewer required for the intended claim/deployment.
6. [ ] Begin the academic problem/requirements synthesis in parallel.
7. [ ] If a real launch is actually intended, identify the operating organisation, provider-directory owner and infrastructure owner before provisioning production.

The fastest defensible route to **university completion** is A1 -> A2/A3/A4/A5/A6 -> fix/retest concrete findings -> A7.

The route to a **real public launch** continues through B1-B9 after the necessary external approvals and operational ownership exist.
