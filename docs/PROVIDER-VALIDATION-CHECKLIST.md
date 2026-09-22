# TalkPoint Provider & Directory Validation Checklist

Status: **not validated for a real-provider pilot**. This checklist structures the evidence required before replacing synthetic/demo provider operation with real checked service data or a real assisted-contact pilot.

## 1. Provider identity and authority

For each provider considered for the real directory or pilot, record:

- official organisation name;
- provider type;
- authoritative website/contact source;
- named operational contact;
- authority of that contact to confirm service information / participate in a pilot;
- whether any formal agreement exists;
- date checked.

Do not imply a partnership from public directory information alone.

## 2. Service-record verification

For every real service record validate:

- service name and description;
- supported topics;
- district/coverage;
- age eligibility;
- online/in-person/phone delivery modes;
- language availability;
- eligibility/access requirements;
- current contact channels;
- current hours/availability;
- provider type;
- immediate-support capability, only where qualified safety validation also permits that label;
- authoritative source;
- information checked date;
- next recheck date / cadence.

Record discrepancies and suppress uncertain facts rather than guessing.

## 3. Directory-only vs integrated status

Confirm each service is explicitly classified as:

- **Directory-only:** the user contacts the service independently; or
- **Integrated/pilot:** the provider has formally agreed to receive user-directed assisted contact requests.

A service must not be marked integrated based only on technical capability.

## 4. Assisted-contact pilot agreement

Before enabling a real assisted handoff, agree and document:

- recipient organisation and authorised operational users;
- exact data fields the provider will receive;
- permitted purpose;
- service hours / response expectations, if any;
- provider queue ownership and assignment process;
- permitted statuses/outcomes;
- retention/deletion responsibilities;
- consent withdrawal/deletion coordination;
- security and access expectations;
- incident/escalation contacts;
- pilot start/end/review criteria;
- statement that TalkPoint does not guarantee acceptance, response or suitability.

## 5. Provider workspace operational validation

Using controlled test data, verify with the provider or authorised pilot representative that:

- organisation isolation works as expected;
- users only see permitted requests;
- request contents match the Sharing Preview;
- excluded data is not visible;
- assignment/status/outcome workflow is understandable;
- withdrawal/deletion behaviour is operationally understood;
- provider users know the workspace is not a clinical CRM or emergency-monitoring tool.

## 6. Data minimisation review

Ask the provider to justify every requested field. Reject requests for extra data unless a frozen-requirement change is supported by evidence and formally approved.

The MVP must not drift into collecting surname, DOB, gender, ID, exact address, full conversation, raw AI reasoning, safety history or other unconsented data merely because a provider says it would be useful.

## 7. Service-data freshness process

Define ownership for:

- scheduled directory rechecks;
- stale-data flags;
- provider-reported corrections;
- temporary closure/unavailability;
- change history;
- suppression of unverified or expired information.

A checked-date field without an operational recheck process is not sufficient for live use.

## 8. Pilot evidence record

For each real pilot, retain:

- provider agreement/reference;
- services enabled;
- provider users/roles configured;
- build/version tested;
- controlled test cases;
- issues found;
- corrections made;
- provider acceptance/sign-off;
- unresolved limitations;
- decision to continue, pause or stop the pilot.

Do not place real user contact data or sensitive case content in the repository.

## Sign-off

- Provider/organisation:
- Reviewer/operational owner:
- Date:
- Scope reviewed:
- Decision: Approved / Approved with conditions / Changes required / Not participating
- Conditions/changes:
- Evidence references:
- Recheck date:

## Release gate

Until a service passes the relevant checks, keep it synthetic/demo or directory-only as appropriate. No live provider handoff may be inferred from a technically working demo integration alone.
