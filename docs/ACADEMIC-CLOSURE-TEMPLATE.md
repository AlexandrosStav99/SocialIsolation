# TalkPoint Academic Evaluation & Closure Template

Status: **template only**. Do not populate conclusions that depend on validation activities that have not actually happened.

Purpose: provide a defensible evidence chain for the final academic report/viva after the remaining validation gates are executed.

## 1. Problem and rationale

Document:

- original problem statement;
- evidence/research sources used to justify it;
- target population and context;
- assumptions made at project start;
- which assumptions were later supported, weakened or left unvalidated.

For each material product choice, answer the viva question: **Why was it designed this way?**

## 2. Requirements traceability

For each material requirement, record:

- source: research / frozen spec / privacy constraint / safety constraint / usability evidence / technical constraint;
- implementation reference;
- verification evidence;
- known limitation;
- whether later validation caused a change.

Prioritise traceability for:

- anonymous-first exploration;
- four-domain privacy separation;
- deterministic service discovery;
- optional free text boundary;
- provider-specific consent and Sharing Preview;
- safety routing boundary;
- EN/EL support;
- accessibility decisions;
- demo vs live-data separation.

## 3. Engineering implementation evidence

Summarise with references rather than unsupported claims:

- architecture and data boundaries;
- Payload/PostgreSQL runtime and migration ownership;
- deterministic conversation/discovery/safety logic;
- AI authority boundary and fallback;
- handoff/consent separation;
- provider RBAC/organisation isolation;
- privacy-safe analytics;
- logging/deletion controls;
- dependency/security gates;
- production build and Playwright coverage.

State clearly that green CI demonstrates tested implementation properties, not legal compliance, safety suitability or human usability by itself.

## 4. Validation results

### 4.1 End-to-end and routing

Record reproducible automated/manual scenarios, failures discovered and corrections made.

### 4.2 Manual accessibility

Reference completed runs from `MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md`.

Include:

- devices/browsers/assistive technologies;
- issues by severity;
- fixes/retests;
- unresolved barriers;
- whether any formal conformance claim is justified. Do not claim one automatically.

### 4.3 Target-user usability

Reference real records produced from `USABILITY-SESSION-RECORD-TEMPLATE.md`.

Include only actual:

- participant count and recruitment method;
- task outcomes;
- recurring mental-model errors;
- issue severity/frequency;
- changes made;
- retest results;
- limitations of the sample/method.

Do not invent quotes, percentages or participant characteristics.

### 4.4 Safety/domain validation

Reference the completed `SAFETY-CONTENT-VALIDATION-CHECKLIST.md` evidence package.

Record reviewer authority, version reviewed, approved/rejected items, changes and remaining risks.

### 4.5 Privacy/legal validation

Reference `PRIVACY-LEGAL-VALIDATION-CHECKLIST.md` and record actual professional/authorised review outcomes.

### 4.6 Provider/directory validation

Reference `PROVIDER-VALIDATION-CHECKLIST.md` where real directory or provider-pilot evidence exists.

Do not imply live partnerships where none exist.

## 5. Material findings and iteration log

For each material finding:

| Finding | Evidence source | Severity | Decision | Change | Verification/retest | Residual risk |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

A decision not to change the product is valid only when the rationale/trade-off is documented.

## 6. Failures and negative evidence

Explicitly include:

- approaches that failed;
- assumptions contradicted by users/reviewers;
- defects found late;
- tests that initially failed and root causes;
- scope items deliberately rejected;
- data/evidence that remained inconclusive.

Negative evidence strengthens academic credibility when reported accurately.

## 7. Limitations

Separate:

- university-demonstration limitations;
- sample/method limitations;
- technical limitations;
- accessibility limitations;
- safety/domain limitations;
- legal/privacy limitations;
- directory/provider limitations;
- production/infrastructure limitations.

Do not describe an intentionally open validation item as an implementation defect unless it actually is one.

## 8. Definition-of-Done decision

Evaluate the exact frozen statement:

> Problem validated → solution justified → complete product implemented → routing verified → safety reviewed → privacy/security tested → target users evaluated → material findings incorporated → limitations documented.

For each clause mark:

- **Supported by evidence**;
- **Partially supported**;
- **Not supported yet**.

The overall MVP may be called fully DONE only when the evidence supports every material clause. Otherwise state precisely what remains open.

## 9. Final viva evidence index

Create a compact index linking:

- frozen specification;
- architecture/phase reviews;
- validation evidence matrix;
- CI run(s)/commit(s);
- usability findings;
- accessibility audit;
- safety/domain sign-off;
- privacy/legal review;
- provider/directory evidence if applicable;
- final limitations;
- final Definition-of-Done decision.

The goal is not to make the project look perfect. The goal is to make every important claim auditable and defensible.
