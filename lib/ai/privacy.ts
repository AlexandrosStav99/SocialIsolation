const CONTACT_PATTERNS=[/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,/\+?\d[\d\s().-]{6,}\d/g];

export function minimiseFreeTextForAi(text:string): string {
  let value=text.trim().slice(0,500);
  for(const pattern of CONTACT_PATTERNS) value=value.replace(pattern,"[redacted]");
  return value;
}

export type ForbiddenAiIdentityContext = { preferredName?:never; email?:never; phone?:never; contactRequestId?:never };
