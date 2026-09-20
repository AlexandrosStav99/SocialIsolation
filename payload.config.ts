import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { getDatabaseUrl, getPayloadSecret } from "@/lib/config/server";
import { ProviderOrganisations } from "@/payload/collections/ProviderOrganisations";
import { Providers } from "@/payload/collections/Providers";
import { Services } from "@/payload/collections/Services";
import { ProviderUsers } from "@/payload/collections/ProviderUsers";
import { ContactRequests } from "@/payload/collections/ContactRequests";
import { ConsentRecords } from "@/payload/collections/ConsentRecords";
import { EphemeralSessions } from "@/payload/collections/EphemeralSessions";
import { AnonymousAnalyticsEvents } from "@/payload/collections/AnonymousAnalyticsEvents";
import { ProviderAuditEvents } from "@/payload/collections/ProviderAuditEvents";

export default buildConfig({
  secret: getPayloadSecret(),
  db: postgresAdapter({
    pool: { connectionString: getDatabaseUrl() },
    migrationDir: "./migrations",
  }),
  collections: [
    ProviderOrganisations,
    ProviderUsers,
    Providers,
    Services,
    EphemeralSessions,
    AnonymousAnalyticsEvents,
    ContactRequests,
    ConsentRecords,
    ProviderAuditEvents,
  ],
  typescript: { outputFile: "payload-types.ts" },
});
