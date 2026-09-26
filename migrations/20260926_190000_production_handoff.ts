import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      ADD COLUMN "production_handoff_enabled" boolean DEFAULT false NOT NULL,
      ADD COLUMN "production_handoff_provider_id" integer,
      ADD COLUMN "production_handoff_organisation_id" integer;

    ALTER TABLE "contact_requests"
      ADD COLUMN "management_token_envelope" varchar,
      ADD COLUMN "idempotency_key_hash" varchar,
      ADD COLUMN "idempotency_payload_hash" varchar;

    ALTER TABLE "services" ADD CONSTRAINT "services_production_handoff_provider_id_providers_id_fk" FOREIGN KEY ("production_handoff_provider_id") REFERENCES "public"."providers"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "services" ADD CONSTRAINT "services_production_handoff_organisation_id_provider_organisations_id_fk" FOREIGN KEY ("production_handoff_organisation_id") REFERENCES "public"."provider_organisations"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX "services_production_handoff_provider_idx"
      ON "services" USING btree ("production_handoff_provider_id");
    CREATE INDEX "services_production_handoff_organisation_idx"
      ON "services" USING btree ("production_handoff_organisation_id");

    CREATE UNIQUE INDEX "contact_requests_idempotency_key_hash_idx"
      ON "contact_requests" USING btree ("idempotency_key_hash");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "contact_requests_idempotency_key_hash_idx";
    DROP INDEX IF EXISTS "services_production_handoff_organisation_idx";
    DROP INDEX IF EXISTS "services_production_handoff_provider_idx";

    ALTER TABLE "contact_requests"
      DROP COLUMN "idempotency_payload_hash",
      DROP COLUMN "management_token_envelope",
      DROP COLUMN "idempotency_key_hash";

    ALTER TABLE "services"
      DROP CONSTRAINT IF EXISTS "services_production_handoff_provider_id_providers_id_fk",
      DROP CONSTRAINT IF EXISTS "services_production_handoff_organisation_id_provider_organisations_id_fk",
      DROP COLUMN "production_handoff_organisation_id",
      DROP COLUMN "production_handoff_provider_id",
      DROP COLUMN "production_handoff_enabled";
  `)
}
