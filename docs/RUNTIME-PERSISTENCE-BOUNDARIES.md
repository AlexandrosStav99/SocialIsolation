# Runtime persistence boundaries

This production-hardening increment maps the frozen TalkPoint data domains into Payload/PostgreSQL without collapsing them into one user record.

- Ephemeral sessions are a separate hidden collection with explicit expiry and purge support. Temporary free text remains confined to this domain.
- Anonymous analytics events contain no session, request, user, provider-user or contact identifier.
- Contact requests contain only the consented operational minimum and a one-way management token hash field. They do not contain transcripts, raw conversation answers, AI reasoning or safety-trigger history.
- Consent records remain separate and retain authorised categories, consent version, recipient, consent timestamp and withdrawal timestamp.
- Provider users carry role and organisation scope validation. Platform roles cannot inherit an organisation and provider roles require one.
- Provider audit events are metadata-only.

Collection presence is not by itself an authorization system. Provider request access must still be enforced through authenticated server-side operations using the existing organisation-scope rules. Real deployment also requires database migrations, secret management and retention operations.
