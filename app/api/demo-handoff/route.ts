import { NextResponse } from "next/server";
import { createSharingPreview } from "@/lib/handoff/preview";
import { createConsentedContactRequest } from "@/lib/handoff/create-request";
import { requireAuthenticatedActor } from "@/lib/provider/auth";
import { getProviderQueue } from "@/lib/provider/queue";
import { transitionRequestStatus } from "@/lib/provider/workflow";
import { supportTopics, serviceAreas, type SupportTopic, type ServiceArea } from "@/lib/domain/data-boundaries";
import { securityErrorResponse } from "@/lib/security/api-response";
import { noStoreHeaders, readJsonBodyLimited } from "@/lib/security/http-hardening";

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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function error(message: string, code: string, status = 400) {
  return NextResponse.json({ error: message, code }, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  try {
    const parsed = asRecord(await readJsonBodyLimited(request, 4 * 1024));
    if (!parsed) return error("Request body must be an object", "invalid_request");

    const body = parsed as DemoHandoffBody;
    if (!body.consentAccepted) {
      return error("Explicit consent is required", "consent_required");
    }
    if (!body.serviceId || !(body.serviceId in DEMO_SERVICES)) {
      return error("Unknown demonstration service", "unknown_service");
    }
    const service = DEMO_SERVICES[body.serviceId as DemoServiceId];
    if (!service.integrated) {
      return error("Service is not enabled for assisted contact", "service_not_integrated");
    }
    if (
      !supportTopics.includes(body.primarySupportTopic as SupportTopic) ||
      !serviceAreas.includes(body.serviceArea as ServiceArea)
    ) {
      return error("Invalid demonstration input", "invalid_demo_input");
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

    return NextResponse.json(
      {
        label: "Demonstration Data",
        requestCreated: true,
        queueVisible: queue.length === 1,
        status: updated.status,
        realRequestSent: false,
      },
      { headers: noStoreHeaders },
    );
  } catch (caught) {
    const securityResponse = securityErrorResponse(caught);
    if (securityResponse) return securityResponse;
    return error("Demonstration handoff failed", "demo_handoff_error", 500);
  }
}
