import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "provider_users" ADD COLUMN "active" boolean DEFAULT false NOT NULL;
    UPDATE "provider_users" SET "active" = true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "provider_users" DROP COLUMN "active";
  `)
}
