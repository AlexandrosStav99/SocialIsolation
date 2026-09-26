import { postgresAdapter } from "@payloadcms/db-postgres";
import { index, integer, pgTable, serial, timestamp, uniqueIndex, varchar } from "@payloadcms/db-postgres/drizzle/pg-core";
import { buildConfig } from "payload";
import { getDatabaseUrl, getPayloadSecret } from "./lib/config/server.ts";
import { ProviderOrganisations } from "./payload/collections/ProviderOrganisations.ts";
import { Providers } from "./payload/collections/Providers.ts";
import { Services } from "./payload/collections/Services.ts";
import { ProviderUsers } from "./payload/collections/ProviderUsers.ts";
import { ContactRequests } from "./payload/collections/ContactRequests.ts";
import { ConsentRecords } from "./payload/collections/ConsentRecords.ts";
import { EphemeralSessions } from "./payload/collections/EphemeralSessions.ts";
import { AnonymousAnalyticsEvents } from "./payload/collections/AnonymousAnalyticsEvents.ts";
import { ProviderAuditEvents } from "./payload/collections/ProviderAuditEvents.ts";
import {
  hiddenSystemCollection,
  platformManagedCollection,
  providerUserAdminCollection,
} from "./payload/access.ts";
const apiRateLimitBuckets = pgTable(
  "api_rate_limit_buckets",
  {
    id: serial("id").primaryKey().notNull(),
    bucketKey: varchar("bucket_key").notNull(),
    scope: varchar("scope").notNull(),
    requestCount: integer("request_count").default(0).notNull(),
    windowStartedAt: timestamp("window_started_at", { precision: 3, withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { precision: 3, withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { precision: 3, withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("api_rate_limit_buckets_bucket_key_idx").on(table.bucketKey),
    index("api_rate_limit_buckets_scope_idx").on(table.scope),
    index("api_rate_limit_buckets_expires_at_idx").on(table.expiresAt),
  ],
);


export default buildConfig({
  secret: getPayloadSecret(),
  db: postgresAdapter({
    pool: { connectionString: getDatabaseUrl() },
    migrationDir: "./migrations",
    beforeSchemaInit: [
      ({ schema }) => ({
        ...schema,
        tables: {
          ...schema.tables,
          apiRateLimitBuckets,
        },
      }),
    ],
  }),
  admin: {
    user: "provider-users",
  },
  routes: {
    api: "/payload-api",
  },
  collections: [
    platformManagedCollection(ProviderOrganisations),
    providerUserAdminCollection(ProviderUsers),
    platformManagedCollection(Providers),
    platformManagedCollection(Services),
    hiddenSystemCollection(EphemeralSessions),
    hiddenSystemCollection(AnonymousAnalyticsEvents),
    hiddenSystemCollection(ContactRequests),
    hiddenSystemCollection(ConsentRecords),
    hiddenSystemCollection(ProviderAuditEvents),
  ],
  typescript: { outputFile: "payload-types.ts" },
});
