import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "api_rate_limit_buckets" (
      "id" serial PRIMARY KEY NOT NULL,
      "bucket_key" varchar NOT NULL,
      "scope" varchar NOT NULL,
      "request_count" integer DEFAULT 0 NOT NULL,
      "window_started_at" timestamp(3) with time zone NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX "api_rate_limit_buckets_bucket_key_idx"
      ON "api_rate_limit_buckets" USING btree ("bucket_key");
    CREATE INDEX "api_rate_limit_buckets_scope_idx"
      ON "api_rate_limit_buckets" USING btree ("scope");
    CREATE INDEX "api_rate_limit_buckets_expires_at_idx"
      ON "api_rate_limit_buckets" USING btree ("expires_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "api_rate_limit_buckets";
  `)
}
