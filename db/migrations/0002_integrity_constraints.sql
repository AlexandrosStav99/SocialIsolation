-- Phase 1 integrity hardening.
ALTER TABLE contact_requests
  ADD CONSTRAINT secondary_support_topics_max_three
  CHECK (cardinality(secondary_support_topics) <= 2);

ALTER TABLE consent_records
  ADD CONSTRAINT consent_categories_not_empty
  CHECK (cardinality(authorised_data_categories) > 0);

CREATE INDEX contact_requests_provider_org_idx
  ON contact_requests(provider_organisation_id, created_at DESC);

CREATE INDEX contact_requests_assignee_idx
  ON contact_requests(assigned_provider_user_id)
  WHERE assigned_provider_user_id IS NOT NULL;

CREATE INDEX consent_records_request_idx
  ON consent_records(request_id);

-- Do not add indexes intended to correlate anonymous analytics with identifiable records.
