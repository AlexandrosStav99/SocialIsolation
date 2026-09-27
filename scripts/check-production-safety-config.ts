import {
  productionSafetyConfiguration,
  validateProductionSafetyConfiguration,
  type ProductionSafetyConfiguration,
} from "../lib/safety/production-config.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectInvalid(
  configuration: ProductionSafetyConfiguration,
  now: Date,
  expectedFragment: string,
): void {
  try {
    validateProductionSafetyConfiguration(configuration, now);
  } catch (error) {
    assert(error instanceof Error, "Expected safety configuration Error");
    assert(
      error.message.includes(expectedFragment),
      'Expected error containing "' + expectedFragment + '", got "' + error.message + '"',
    );
    return;
  }
  throw new Error("Expected invalid production safety configuration");
}

const now = new Date("2026-09-27T10:00:00.000Z");

expectInvalid(
  productionSafetyConfiguration,
  now,
  "matrix is not externally approved",
);

const validFixture: ProductionSafetyConfiguration = {
  matrixStatus: "approved",
  version: "ci-safety-v1",
  approvalReference: "CI-only-qualified-review-fixture",
  reviewedAt: "2026-09-26T10:00:00.000Z",
  nextReviewAt: "2026-10-27T10:00:00.000Z",
  presentation: {
    copy: {
      en: {
        action: "CI help action",
        heading: "CI immediate support",
        notice: "CI-only reviewed wording fixture.",
        continueAction: "Continue CI journey",
        resourcesHeading: "CI checked resources",
        sourceLabel: "Information source",
        checkedLabel: "Information checked",
      },
      el: {
        action: "CI ενέργεια βοήθειας",
        heading: "CI άμεση υποστήριξη",
        notice: "CI-only ελεγμένο κείμενο δοκιμής.",
        continueAction: "Συνέχεια CI",
        resourcesHeading: "CI ελεγμένοι πόροι",
        sourceLabel: "Πηγή πληροφοριών",
        checkedLabel: "Έλεγχος πληροφοριών",
      },
    },
    resources: [
      {
        id: "ci-resource",
        name: { en: "CI resource", el: "CI πόρος" },
        description: {
          en: "Controlled CI-only resource fixture.",
          el: "Ελεγχόμενος πόρος μόνο για CI.",
        },
        scope: { en: "CI-only scope", el: "Πεδίο μόνο για CI" },
        audienceEligibility: {
          en: "CI-only eligibility",
          el: "Κριτήρια μόνο για CI",
        },
        availability: {
          en: "CI-only availability",
          el: "Διαθεσιμότητα μόνο για CI",
        },
        languages: ["en", "el"],
        contact: {
          type: "url",
          value: "https://example.org/ci-safety-fixture",
          display: "https://example.org/ci-safety-fixture",
        },
        informationSource: "https://example.org/ci-authoritative-source-fixture",
        informationCheckedAt: "2026-09-26T09:00:00.000Z",
        nextReviewAt: "2026-10-27T09:00:00.000Z",
        immediateSupportApproved: true,
      },
    ],
  },
};

const validated = validateProductionSafetyConfiguration(validFixture, now);
assert(validated.resources.length === 1, "Valid approved safety fixture was rejected");

expectInvalid(
  { ...validFixture, nextReviewAt: "2026-09-27T09:59:59.000Z" },
  now,
  "approval/resource review is stale",
);

expectInvalid(
  {
    ...validFixture,
    presentation: {
      ...validFixture.presentation!,
      resources: [],
    },
  },
  now,
  "requires at least one approved resource",
);

expectInvalid(
  {
    ...validFixture,
    presentation: {
      ...validFixture.presentation!,
      copy: {
        ...validFixture.presentation!.copy,
        el: {
          ...validFixture.presentation!.copy.el,
          notice: "",
        },
      },
    },
  },
  now,
  "el notice",
);

expectInvalid(
  {
    ...validFixture,
    presentation: {
      ...validFixture.presentation!,
      resources: validFixture.presentation!.resources.map((resource) => ({
        ...resource,
        nextReviewAt: "2026-09-27T09:59:59.000Z",
      })),
    },
  },
  now,
  "approval/resource review is stale",
);

expectInvalid(
  {
    ...validFixture,
    presentation: {
      ...validFixture.presentation!,
      resources: validFixture.presentation!.resources.map((resource) => ({
        ...resource,
        contact: {
          type: "url" as const,
          value: "http://example.org/unsafe",
          display: "http://example.org/unsafe",
        },
      })),
    },
  },
  now,
  "must be a public HTTPS URL",
);

console.log("Production safety configuration validation checks passed.");
