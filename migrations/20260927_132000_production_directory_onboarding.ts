import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_providers_production_directory_source_type" AS ENUM(
      'official_provider_source',
      'public_authority_source',
      'provider_operational_confirmation',
      'other_authoritative_source'
    );
    CREATE TYPE "public"."enum_services_production_directory_source_type" AS ENUM(
      'official_provider_source',
      'public_authority_source',
      'provider_operational_confirmation',
      'other_authoritative_source'
    );

    ALTER TABLE "providers"
      ADD COLUMN "production_directory_verified" boolean DEFAULT false NOT NULL,
      ADD COLUMN "production_directory_suppressed" boolean DEFAULT true NOT NULL,
      ADD COLUMN "production_directory_source_type" "enum_providers_production_directory_source_type",
      ADD COLUMN "production_directory_next_review_at" timestamp(3) with time zone;

    ALTER TABLE "services"
      ADD COLUMN "production_directory_verified" boolean DEFAULT false NOT NULL,
      ADD COLUMN "production_directory_suppressed" boolean DEFAULT true NOT NULL,
      ADD COLUMN "production_directory_source_type" "enum_services_production_directory_source_type",
      ADD COLUMN "production_directory_next_review_at" timestamp(3) with time zone,
      ADD COLUMN "production_directory_enabled" boolean DEFAULT false NOT NULL;

    CREATE INDEX "providers_production_directory_next_review_at_idx"
      ON "providers" USING btree ("production_directory_next_review_at");
    CREATE INDEX "services_production_directory_next_review_at_idx"
      ON "services" USING btree ("production_directory_next_review_at");
    CREATE INDEX "services_production_directory_enabled_idx"
      ON "services" USING btree ("production_directory_enabled");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "services_production_directory_enabled_idx";
    DROP INDEX IF EXISTS "services_production_directory_next_review_at_idx";
    DROP INDEX IF EXISTS "providers_production_directory_next_review_at_idx";

    ALTER TABLE "services"
      DROP COLUMN "production_directory_enabled",
      DROP COLUMN "production_directory_next_review_at",
      DROP COLUMN "production_directory_source_type",
      DROP COLUMN "production_directory_suppressed",
      DROP COLUMN "production_directory_verified";

    ALTER TABLE "providers"
      DROP COLUMN "production_directory_next_review_at",
      DROP COLUMN "production_directory_source_type",
      DROP COLUMN "production_directory_suppressed",
      DROP COLUMN "production_directory_verified";

    DROP TYPE IF EXISTS "public"."enum_services_production_directory_source_type";
    DROP TYPE IF EXISTS "public"."enum_providers_production_directory_source_type";
  `);
}
