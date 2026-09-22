import { NextResponse } from "next/server";
import { createSharingPreview } from "@/lib/handoff/preview";
import { createConsentedContactRequest } from "@/lib/handoff/create-request";
import { requireAuthenticatedActor } from "@/lib/provider/auth";
import { getProviderQueue } from "@/lib/provider/queue";
import { transitionRequestStatus } from "@/lib/provider/workflow";
import { supportTopics, serviceAreas, type SupportTopic, type ServiceArea } from "@/lib/domain/data-boundaries";

const DEMO_SERVICES = {
  "demo-community-online": { providerOrganisationId: "demo-community-provider", integrated: true },
  "demo-student-online": { providerOrganisationId: "demo-student-provider", integrated: false },
} as const;

type DemoServiceId = keyof typeof DEMO_SERVICES;
type DemoHandoffBody = {
  serviceId?: string;
  consentAccepted?: boolean;
  primarySupportTopic?: string;
  secondarySupportTopics?: string[];
  serviceArea?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as DemoHandoffBody;
  if (!body.consentAccepted) {
    return NextResponse.json({ error: "Explicit consent is required" }, { status: 400 });
  }
  if (!body.serviceId || !(body.serviceId in DEMO_SERVICES)) {
    return NextResponse.json({ error: "Unknown demonstration service" }, { status: 400 });
  }
  const service = DEMO_SERVICES[body.serviceId as DemoServiceId];
  if (!service.integrated) {
    return NextResponse.json({ error: "Service is not enabled for assisted contact" }, { status: 400 });
  }
  if (
    !supportTopics.includes(body.primarySupportTopic as SupportTopic) ||
    !serviceAreas.includes(body.serviceArea as ServiceArea)
  ) {
    return NextResponse.json({ error: "Invalid demonstration input" }, { status: 400 });
  }

  const secondaries = (body.secondarySupportTopics ?? [])
    .filter((topic): topic is SupportTopic => supportTopics.includes(topic as SupportTopic))
    .slice(0, 2);
  const preview = createSharingPreview({
    providerOrganisationId: service.providerOrganisationId,
    serviceId: body.serviceId,
    contact: { type: "email", value: "fictional-user@example.invalid" },
    primarySupportTopic: body.primarySupportTopic as SupportTopic,
    secondarySupportTopics: secondaries,
    serviceArea: body.serviceArea as ServiceArea,
    preferences: [],
    structuredSupportSummary: "Synthetic controlled demonstration summary. No real user data.",
  });
  const created = createConsentedContactRequest(preview, {
    accepted: body.consentAccepted,
    consentVersion: "demo-v2",
    optionalNoteAccepted: false,
  });

  const actor = requireAuthenticatedActor({
    userId: "demo-provider-manager",
    role: "provider_manager",
    organisationId: service.providerOrganisationId,
  });
  const queue = getProviderQueue(actor, [created.request]);
  const updated = transitionRequestStatus(actor, queue[0], "contact_attempted");

  return NextResponse.json({
    label: "Demonstration Data",
    requestCreated: true,
    queueVisible: queue.length === 1,
    status: updated.status,
    realRequestSent: false,
  });
}
