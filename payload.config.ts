import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { getDatabaseUrl, getPayloadSecret } from "@/lib/config/server";
import { ProviderOrganisations } from "@/payload/collections/ProviderOrganisations";
import { Providers } from "@/payload/collections/Providers";
import { Services } from "@/payload/collections/Services";

export default buildConfig({
  secret: getPayloadSecret(),
  db: postgresAdapter({ pool: { connectionString: getDatabaseUrl() } }),
  collections: [ProviderOrganisations, Providers, Services],
  typescript: { outputFile: "payload-types.ts" },
});
