import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "contact_requests"
      ADD COLUMN "public_request_id" varchar;

    UPDATE "contact_requests"
      SET "public_request_id" = gen_random_uuid()::text
      WHERE "public_request_id" IS NULL;

    ALTER TABLE "contact_requests"
      ALTER COLUMN "public_request_id" SET NOT NULL;

    ALTER TABLE "consent_records"
      ALTER COLUMN "request_id" DROP NOT NULL,
      ADD COLUMN "request_deleted_at" timestamp(3) with time zone,
      ADD COLUMN "deleted_request_public_id" varchar,
      ADD COLUMN "deleted_management_token_hash" varchar,
      ADD COLUMN "deleted_idempotency_key_hash" varchar,
      ADD COLUMN "deleted_idempotency_payload_hash" varchar,
      ADD COLUMN "deletion_reason" varchar;

    CREATE UNIQUE INDEX "contact_requests_public_request_id_idx"
      ON "contact_requests" USING btree ("public_request_id");
    CREATE INDEX "contact_requests_closed_at_idx"
      ON "contact_requests" USING btree ("closed_at");
    CREATE INDEX "consent_records_request_deleted_at_idx"
      ON "consent_records" USING btree ("request_deleted_at");
    CREATE UNIQUE INDEX "consent_records_deleted_request_public_id_idx"
      ON "consent_records" USING btree ("deleted_request_public_id");
    CREATE UNIQUE INDEX "consent_records_deleted_idempotency_key_hash_idx"
      ON "consent_records" USING btree ("deleted_idempotency_key_hash");
    CREATE INDEX "provider_audit_events_occurred_at_idx"
      ON "provider_audit_events" USING btree ("occurred_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "provider_audit_events_occurred_at_idx";
    DROP INDEX IF EXISTS "consent_records_deleted_idempotency_key_hash_idx";
    DROP INDEX IF EXISTS "consent_records_deleted_request_public_id_idx";
    DROP INDEX IF EXISTS "consent_records_request_deleted_at_idx";
    DROP INDEX IF EXISTS "contact_requests_closed_at_idx";
    DROP INDEX IF EXISTS "contact_requests_public_request_id_idx";

    DELETE FROM "consent_records" WHERE "request_id" IS NULL;

    ALTER TABLE "consent_records"
      DROP COLUMN "deletion_reason",
      DROP COLUMN "deleted_idempotency_payload_hash",
      DROP COLUMN "deleted_idempotency_key_hash",
      DROP COLUMN "deleted_management_token_hash",
      DROP COLUMN "deleted_request_public_id",
      DROP COLUMN "request_deleted_at",
      ALTER COLUMN "request_id" SET NOT NULL;

    ALTER TABLE "contact_requests"
      DROP COLUMN "public_request_id";
  `)
}
