-- ARCHITECTURE BASELINE ONLY - DO NOT EXECUTE against the current Payload-managed database.\n-- This Phase 1 SQL predates the Payload runtime collections and overlaps their table names.\n-- Payload migrations are the sole runtime schema authority. See docs/DATABASE-MIGRATION-OWNERSHIP.md.\n-- TalkPoint Phase 1 storage boundaries.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE talkpoint_role AS ENUM ('super_admin','platform_admin','provider_manager','provider_staff');
CREATE TYPE contact_method AS ENUM ('email','phone');
CREATE TYPE request_status AS ENUM ('new','assigned','contact_attempted','contacted','accepted','closed','unable_to_reach','referred_elsewhere','user_declined');

CREATE TABLE provider_organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE provider_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES provider_organisations(id) ON DELETE RESTRICT,
  email text NOT NULL UNIQUE,
  role talkpoint_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_role_scope CHECK (
    (role IN ('super_admin','platform_admin') AND organisation_id IS NULL)
    OR
    (role IN ('provider_manager','provider_staff') AND organisation_id IS NOT NULL)
  )
);

CREATE TABLE providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES provider_organisations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  provider_type text NOT NULL,
  information_source text,
  information_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_integrated boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ephemeral sessions are intentionally isolated from analytics and contact requests.
CREATE TABLE ephemeral_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage text NOT NULL,
  structured_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  temporary_free_text text,
  candidate_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_routing_state text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ephemeral_sessions_expiry_idx ON ephemeral_sessions(expires_at);

-- IMPORTANT: no session_id, request_id, user_id or contact fields belong here.
CREATE TABLE anonymous_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_support_topic text,
  secondary_support_topics text[] NOT NULL DEFAULT '{}',
  service_area text,
  interaction_outcome text NOT NULL,
  services_shown_count integer NOT NULL DEFAULT 0 CHECK (services_shown_count >= 0),
  self_service_selected boolean NOT NULL DEFAULT false,
  assisted_contact_selected boolean NOT NULL DEFAULT false,
  no_match boolean NOT NULL DEFAULT false,
  taxonomy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_organisation_id uuid NOT NULL REFERENCES provider_organisations(id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  preferred_name text,
  contact_type contact_method NOT NULL,
  contact_detail text NOT NULL,
  primary_support_topic text NOT NULL,
  secondary_support_topics text[] NOT NULL DEFAULT '{}',
  service_area text,
  preferences text[] NOT NULL DEFAULT '{}',
  structured_support_summary text NOT NULL,
  optional_note text,
  status request_status NOT NULL DEFAULT 'new',
  assigned_provider_user_id uuid REFERENCES provider_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES contact_requests(id) ON DELETE RESTRICT,
  consent_version text NOT NULL,
  recipient_provider_organisation_id uuid NOT NULL REFERENCES provider_organisations(id) ON DELETE RESTRICT,
  authorised_data_categories text[] NOT NULL,
  optional_note_authorised boolean NOT NULL DEFAULT false,
  consented_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);

COMMENT ON TABLE anonymous_analytics_events IS
  'De-identified aggregate input only. Never add a FK to sessions, requests, users or contacts.';
COMMENT ON COLUMN ephemeral_sessions.temporary_free_text IS
  'Temporary only; must be deleted on session completion/expiry and must never enter logs.';
