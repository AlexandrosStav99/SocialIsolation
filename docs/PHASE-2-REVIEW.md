# Phase 2 Review — Directory & Checked Service Data

## Goal

Move provider/service information out of hard-coded UI logic into a structured, validated directory layer without inventing provider relationships or claiming unchecked information is real.

## Implemented

- Frozen Support Taxonomy v1 in Greek and English.
- Structured provider/service contracts and runtime validation.
- Repository abstraction so application features do not depend on hard-coded provider logic.
- Coverage, languages, eligibility, delivery mode, contact channels, availability, provider type, immediate-support capability, integration mode, information source and information-checked date.
- Clearly synthetic development/demo seed records.
- Separate real Cyprus dataset gate. It starts empty and cannot honestly be called checked until authoritative-source research is completed.
- Automated Phase 2 directory invariants for CI.

## Claims boundary

“Information checked” means source/currency checking only. It is not provider accreditation, endorsement or a claim of clinical appropriateness. Demo providers are explicitly synthetic and must never be presented as partnerships.

## Safety boundary

Immediate-support capability exists as metadata, but real immediate-support records and safety copy remain behind the Phase 4/domain-expert validation gate.

## Payload boundary

The directory contracts are Payload-ready and isolate application consumers from storage details. Actual Payload package/runtime installation must not be faked by manually editing a lockfile. The repository currently has no Payload dependency in its npm lock; package installation must be performed through a real npm execution environment so the lockfile and security audit remain trustworthy.

## Real Cyprus data

The frozen plan says “begin checked Cyprus directory dataset”, not invent it. The repository therefore contains an explicit authoritative-source research gate. Real records must be researched and source-checked before entering the checked dataset.

## Exit assessment

Application code can query validated structured service data through a repository contract without embedding provider selection logic in the UI. Final completion requires green CI on the Phase 2 head and authoritative-source research for any real Cyprus records that are added.
