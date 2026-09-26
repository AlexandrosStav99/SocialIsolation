import { getPayload } from "payload";
import config from "../payload.config.ts";
import { providerActorFromPayloadUser, ProviderWorkspaceError } from "../lib/provider/payload-auth.ts";
import {
  assignProviderRequest,
  getProviderRequestDetail,
  listProviderRequests,
  transitionProviderRequest,
} from "../lib/provider/payload-workspace.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectWorkspaceError(
  operation: () => Promise<unknown> | unknown,
  code: string,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    assert(error instanceof ProviderWorkspaceError, "Expected ProviderWorkspaceError for " + code);
    assert(error.code === code, "Expected " + code + ", received " + error.code);
    return;
  }
  throw new Error("Expected provider workspace error " + code);
}

async function main() {
  const payload = await getPayload({ config });
  const created = {
    organisations: [] as Array<string | number>,
    providers: [] as Array<string | number>,
    services: [] as Array<string | number>,
    users: [] as Array<string | number>,
    requests: [] as Array<string | number>,
  };
  let exitCode = 0;

  try {
    const organisationA = await payload.create({
      collection: "provider-organisations",
      data: { name: "PROD-3 CI Organisation A" },
      overrideAccess: true,
    });
    const organisationB = await payload.create({
      collection: "provider-organisations",
      data: { name: "PROD-3 CI Organisation B" },
      overrideAccess: true,
    });
    created.organisations.push(organisationA.id, organisationB.id);

    const providerA = await payload.create({
      collection: "providers",
      data: {
        organisation: organisationA.id,
        name: "PROD-3 CI Provider A",
        providerType: "ngo_nonprofit",
        informationSource: "Controlled CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    const providerB = await payload.create({
      collection: "providers",
      data: {
        organisation: organisationB.id,
        name: "PROD-3 CI Provider B",
        providerType: "public_community",
        informationSource: "Controlled CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    created.providers.push(providerA.id, providerB.id);

    const serviceA = await payload.create({
      collection: "services",
      data: {
        provider: providerA.id,
        name: "PROD-3 CI Service A",
        topics: ["social_connection"],
        coverage: ["online"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["Controlled CI fixture"],
        contactChannels: ["ci-fixture@example.invalid"],
        availability: "Controlled CI fixture",
        immediateSupportCapable: false,
        integrated: true,
        informationSource: "Controlled CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    const serviceB = await payload.create({
      collection: "services",
      data: {
        provider: providerB.id,
        name: "PROD-3 CI Service B",
        topics: ["education_student"],
        coverage: ["online"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["Controlled CI fixture"],
        contactChannels: ["ci-fixture-b@example.invalid"],
        availability: "Controlled CI fixture",
        immediateSupportCapable: false,
        integrated: true,
        informationSource: "Controlled CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    created.services.push(serviceA.id, serviceB.id);

    const managerA = await payload.create({
      collection: "provider-users",
      data: {
        email: "prod3-manager-a@example.invalid",
        password: "Prod3-Manager-A-Password!",
        role: "provider_manager",
        organisation: organisationA.id,
        active: true,
      },
      overrideAccess: true,
    });
    const staffA = await payload.create({
      collection: "provider-users",
      data: {
        email: "prod3-staff-a@example.invalid",
        password: "Prod3-Staff-A-Password!",
        role: "provider_staff",
        organisation: organisationA.id,
        active: true,
      },
      overrideAccess: true,
    });
    const managerB = await payload.create({
      collection: "provider-users",
      data: {
        email: "prod3-manager-b@example.invalid",
        password: "Prod3-Manager-B-Password!",
        role: "provider_manager",
        organisation: organisationB.id,
        active: true,
      },
      overrideAccess: true,
    });
    const staffB = await payload.create({
      collection: "provider-users",
      data: {
        email: "prod3-staff-b@example.invalid",
        password: "Prod3-Staff-B-Password!",
        role: "provider_staff",
        organisation: organisationB.id,
        active: true,
      },
      overrideAccess: true,
    });
    const platformAdmin = await payload.create({
      collection: "provider-users",
      data: {
        email: "prod3-platform@example.invalid",
        password: "Prod3-Platform-Password!",
        role: "platform_admin",
        active: true,
      },
      overrideAccess: true,
    });
    created.users.push(managerA.id, staffA.id, managerB.id, staffB.id, platformAdmin.id);

    const requestA1 = await payload.create({
      collection: "contact-requests",
      data: {
        providerOrganisation: organisationA.id,
        service: serviceA.id,
        preferredName: "Synthetic A1",
        contactType: "email",
        contactDetail: "prod3-a1@example.invalid",
        primarySupportTopic: "social_connection",
        secondarySupportTopics: [],
        serviceArea: "online",
        preferences: ["online"],
        structuredSupportSummary: "Controlled synthetic PROD-3 CI request A1.",
        status: "new",
        managementTokenHash: "ci-only-a1-not-a-real-token",
      },
      overrideAccess: true,
    });
    const requestA2 = await payload.create({
      collection: "contact-requests",
      data: {
        providerOrganisation: organisationA.id,
        service: serviceA.id,
        contactType: "phone",
        contactDetail: "+000000000001",
        primarySupportTopic: "social_connection",
        secondarySupportTopics: [],
        serviceArea: "online",
        preferences: [],
        structuredSupportSummary: "Controlled synthetic PROD-3 CI request A2.",
        status: "assigned",
        assignedProviderUser: staffA.id,
        managementTokenHash: "ci-only-a2-not-a-real-token",
      },
      overrideAccess: true,
    });
    const requestB1 = await payload.create({
      collection: "contact-requests",
      data: {
        providerOrganisation: organisationB.id,
        service: serviceB.id,
        contactType: "email",
        contactDetail: "prod3-b1@example.invalid",
        primarySupportTopic: "education_student",
        secondarySupportTopics: [],
        serviceArea: "online",
        preferences: [],
        structuredSupportSummary: "Controlled synthetic PROD-3 CI request B1.",
        status: "new",
        managementTokenHash: "ci-only-b1-not-a-real-token",
      },
      overrideAccess: true,
    });
    created.requests.push(requestA1.id, requestA2.id, requestB1.id);

    const actorManagerA = providerActorFromPayloadUser(managerA);
    const actorStaffA = providerActorFromPayloadUser(staffA);
    const actorManagerB = providerActorFromPayloadUser(managerB);

    await expectWorkspaceError(
      () => Promise.resolve(providerActorFromPayloadUser(platformAdmin)),
      "provider_role_required",
    );

    const managerAQueue = await listProviderRequests(payload, actorManagerA);
    assert(managerAQueue.totalDocs === 2, "Provider manager must see only their organisation queue");
    assert(
      managerAQueue.items.every((item) => item.id !== String(requestB1.id)),
      "Cross-organisation request leaked into provider manager queue",
    );

    const managerBQueue = await listProviderRequests(payload, actorManagerB);
    assert(managerBQueue.totalDocs === 1, "Second organisation queue scope is incorrect");
    assert(managerBQueue.items[0]?.id === String(requestB1.id), "Second organisation saw the wrong request");

    const staffBeforeAssignment = await listProviderRequests(payload, actorStaffA);
    assert(staffBeforeAssignment.totalDocs === 1, "Provider staff must see assigned requests only");
    assert(
      staffBeforeAssignment.items[0]?.id === String(requestA2.id),
      "Provider staff saw an unassigned or foreign request",
    );

    const detail = await getProviderRequestDetail(payload, actorManagerA, String(requestA1.id));
    assert(detail.contactDetail === "prod3-a1@example.invalid", "Permitted request detail was not returned");
    assert(
      !("managementTokenHash" in (detail as unknown as Record<string, unknown>)),
      "Management token leaked to provider response",
    );

    await expectWorkspaceError(
      () => getProviderRequestDetail(payload, actorManagerB, String(requestA1.id)),
      "provider_request_not_found",
    );

    await expectWorkspaceError(
      () => assignProviderRequest(payload, actorManagerA, String(requestA1.id), String(staffB.id)),
      "invalid_assignee",
    );
    const afterRejectedAssignment = await payload.findByID({
      collection: "contact-requests",
      id: requestA1.id,
      depth: 0,
      overrideAccess: true,
    });
    assert(afterRejectedAssignment.status === "new", "Rejected cross-organisation assignment mutated the request");
    assert(!afterRejectedAssignment.assignedProviderUser, "Rejected assignment persisted a foreign assignee");

    const assigned = await assignProviderRequest(
      payload,
      actorManagerA,
      String(requestA1.id),
      String(staffA.id),
    );
    assert(assigned.status === "assigned", "Assignment must move a new request to assigned");
    assert(assigned.assignedProviderUserId === String(staffA.id), "Assignment target was not persisted");

    const staffAfterAssignment = await listProviderRequests(payload, actorStaffA);
    assert(staffAfterAssignment.totalDocs === 2, "Assigned request did not become visible to provider staff");

    const staffDetail = await getProviderRequestDetail(payload, actorStaffA, String(requestA1.id));
    assert(staffDetail.id === String(requestA1.id), "Assigned staff could not read their request");

    const transitioned = await transitionProviderRequest(
      payload,
      actorStaffA,
      String(requestA1.id),
      "contact_attempted",
    );
    assert(transitioned.status === "contact_attempted", "Valid status transition did not persist");

    await expectWorkspaceError(
      () => transitionProviderRequest(payload, actorStaffA, String(requestA1.id), "accepted"),
      "invalid_status_transition",
    );
    const afterRejectedTransition = await payload.findByID({
      collection: "contact-requests",
      id: requestA1.id,
      depth: 0,
      overrideAccess: true,
    });
    assert(
      afterRejectedTransition.status === "contact_attempted",
      "Rejected status transition changed persisted state",
    );

    await expectWorkspaceError(
      () => assignProviderRequest(payload, actorStaffA, String(requestA2.id), String(staffA.id)),
      "assignment_denied",
    );

    const auditEvents = await payload.find({
      collection: "provider-audit-events",
      where: { requestId: { equals: String(requestA1.id) } },
      limit: 20,
      depth: 0,
      overrideAccess: true,
    });
    const eventTypes = auditEvents.docs.map((event) => event.eventType);
    for (const eventType of ["request_viewed", "request_assigned", "status_changed"]) {
      assert(
        eventTypes.some((stored) => stored === eventType),
        "Missing persisted provider audit event " + eventType,
      );
    }
    assert(
      auditEvents.docs.every((event) => event.organisationId === String(organisationA.id)),
      "Provider audit event lost organisation authority",
    );

    console.log("Provider workspace PostgreSQL isolation, workflow and audit checks passed.");
  } catch (error) {
    exitCode = 1;
    console.error(error);
  } finally {
    try {
      const requestIds = created.requests.map(String);
      if (requestIds.length) {
        const audits = await payload.find({
          collection: "provider-audit-events",
          where: { requestId: { in: requestIds } },
          limit: 100,
          depth: 0,
          overrideAccess: true,
        });
        for (const audit of audits.docs) {
          await payload.delete({ collection: "provider-audit-events", id: audit.id, overrideAccess: true });
        }
      }
      for (const id of created.requests) {
        await payload.delete({ collection: "contact-requests", id, overrideAccess: true });
      }
      for (const id of created.users) {
        await payload.delete({ collection: "provider-users", id, overrideAccess: true });
      }
      for (const id of created.services) {
        await payload.delete({ collection: "services", id, overrideAccess: true });
      }
      for (const id of created.providers) {
        await payload.delete({ collection: "providers", id, overrideAccess: true });
      }
      for (const id of created.organisations) {
        await payload.delete({ collection: "provider-organisations", id, overrideAccess: true });
      }
    } catch (cleanupError) {
      exitCode = 1;
      console.error("PROD-3 CI fixture cleanup failed", cleanupError);
    }
    process.exit(exitCode);
  }
}

void main();
