import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { validateRuntimeConfiguration } from "./lib/config/server";

validateRuntimeConfiguration();

const nextConfig: NextConfig = {};

// Payload's Next.js plugin externalizes server-only dependencies such as
// drizzle-kit so Turbopack does not try to bundle database tooling into app routes.
export default withPayload(nextConfig);
