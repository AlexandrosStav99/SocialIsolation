export type SafetyLanguage = "en" | "el";

export type SafetyPresentationCopy = {
  action: string;
  heading: string;
  notice: string;
  continueAction: string;
  resourcesHeading: string;
  sourceLabel: string;
  checkedLabel: string;
};

export type SafetyResource = {
  id: string;
  name: Record<SafetyLanguage, string>;
  description: Record<SafetyLanguage, string>;
  scope: Record<SafetyLanguage, string>;
  audienceEligibility: Record<SafetyLanguage, string>;
  availability: Record<SafetyLanguage, string>;
  languages: SafetyLanguage[];
  contact:
    | {
        type: "phone";
        value: string;
        display: string;
      }
    | {
        type: "url";
        value: string;
        display: string;
      };
  informationSource: string;
  informationCheckedAt: string;
  nextReviewAt: string;
  immediateSupportApproved: true;
};

export type SafetyPresentation = {
  copy: Record<SafetyLanguage, SafetyPresentationCopy>;
  resources: SafetyResource[];
};
