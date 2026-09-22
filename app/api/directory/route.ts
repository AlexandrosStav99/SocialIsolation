import { NextResponse } from "next/server";
import { demoProviders, demoServices } from "@/data/demo-directory";
import { loadPayloadDemoDirectory } from "@/lib/directory/payload-demo";

export const dynamic = "force-dynamic";

export async function GET() {
  const payloadDirectory = await loadPayloadDemoDirectory();
  const directory = payloadDirectory ?? { providers: demoProviders, services: demoServices };

  return NextResponse.json(
    {
      label: "Demonstration Data",
      source: payloadDirectory ? "payload_postgres" : "synthetic_fallback",
      providers: directory.providers,
      services: directory.services,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
