import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      ADD COLUMN "production_handoff_enabled" boolean DEFAULT false NOT NULL;

    ALTER TABLE "contact_requests"
      ADD COLUMN "management_token_envelope" varchar,
      ADD COLUMN "idempotency_key_hash" varchar,
      ADD COLUMN "idempotency_payload_hash" varchar;

    CREATE UNIQUE INDEX "contact_requests_idempotency_key_hash_idx"
      ON "contact_requests" USING btree ("idempotency_key_hash");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "contact_requests_idempotency_key_hash_idx";

    ALTER TABLE "contact_requests"
      DROP COLUMN "idempotency_payload_hash",
      DROP COLUMN "management_token_envelope",
      DROP COLUMN "idempotency_key_hash";

    ALTER TABLE "services"
      DROP COLUMN "production_handoff_enabled";
  `)
}
