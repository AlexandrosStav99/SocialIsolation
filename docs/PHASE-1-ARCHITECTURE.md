# Phase 1 architecture

Status: implementation in progress.

## Boundary first

Phase 1 establishes storage contracts before TalkPoint accepts real support or contact data. The architecture follows the frozen specification's five domains:

- ephemeral conversation state;
- anonymous analytics;
- identifiable contact requests;
- consent evidence;
- directory and identity data.

The critical invariant is that anonymous analytics does not carry a session, request, user or contact identifier and has no foreign key to identifiable requests.

## Access foundation

Roles are `super_admin`, `platform_admin`, `provider_manager` and `provider_staff`. Platform roles are not automatically members of a provider organisation. Provider roles require an organisation. This models the future RBAC boundary without pretending Phase 7 authorisation is already complete.

## Logging

Application logging must use non-content operational metadata. Free text, contact details, preferred names, structured support summaries and raw AI prompt/response content are forbidden.

## Retention

Ephemeral session records include an expiry timestamp. The actual purge job and final production retention policy are later implementation/validation work; Phase 1 must not invent the unresolved production duration.

## Payload/PostgreSQL

PostgreSQL is the durable data store. Payload will own directory/content/admin collections, while routing and safety remain version-controlled application logic. Payload integration must preserve the domain separation above rather than collapsing all records into a generic CMS model.
