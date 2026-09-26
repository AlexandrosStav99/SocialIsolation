import { postgresAdapter } from "@payloadcms/db-postgres";
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

export default buildConfig({
  secret: getPayloadSecret(),
  db: postgresAdapter({
    pool: { connectionString: getDatabaseUrl() },
    migrationDir: "./migrations",
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
