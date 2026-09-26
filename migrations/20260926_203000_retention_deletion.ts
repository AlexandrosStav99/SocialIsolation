import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "consent_records"
      ALTER COLUMN "request_id" DROP NOT NULL,
      ADD COLUMN "request_deleted_at" timestamp(3) with time zone,
      ADD COLUMN "deletion_reason" varchar;

    CREATE INDEX "contact_requests_closed_at_idx"
      ON "contact_requests" USING btree ("closed_at");
    CREATE INDEX "consent_records_request_deleted_at_idx"
      ON "consent_records" USING btree ("request_deleted_at");
    CREATE INDEX "provider_audit_events_occurred_at_idx"
      ON "provider_audit_events" USING btree ("occurred_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "provider_audit_events_occurred_at_idx";
    DROP INDEX IF EXISTS "consent_records_request_deleted_at_idx";
    DROP INDEX IF EXISTS "contact_requests_closed_at_idx";

    DELETE FROM "consent_records" WHERE "request_id" IS NULL;

    ALTER TABLE "consent_records"
      DROP COLUMN "deletion_reason",
      DROP COLUMN "request_deleted_at",
      ALTER COLUMN "request_id" SET NOT NULL;
  `)
}
