import fs from "node:fs";

const content = fs.readFileSync("lib/i18n/content.ts", "utf8");
const chat = fs.readFileSync("components/check-in/CheckInChat.tsx", "utf8");
const checklist = fs.readFileSync("docs/PHASE-9-ACCESSIBILITY-CHECKLIST.md", "utf8");
const validation = fs.readFileSync("docs/UX-5-VALIDATION-STATUS.md", "utf8");
const usability = fs.readFileSync("docs/UX-5-USABILITY-TEST-PLAN.md", "utf8");
const navbar = fs.readFileSync("components/Navbar.tsx", "utf8");
const integrated = fs.readFileSync("components/check-in/IntegratedCheckIn.tsx", "utf8");

for (const key of ["title", "status", "conversation", "input", "placeholder", "send", "latest", "helpNow", "empty", "loading", "noMatch"]) {
  if (!content.includes(key)) throw new Error("Missing bilingual UX state: " + key);
}

for (const invariant of ['aria-live="polite"', 'aria-relevant="additions text"']) {
  if (!chat.includes(invariant)) throw new Error("Missing screen-reader log behaviour: " + invariant);
}

if (!checklist.includes("WCAG 2.2 AA") || !checklist.includes("not a compliance certification")) {
  throw new Error("Accessibility claim boundary missing");
}

for (const invariant of ["aria-expanded", "aria-controls", "Escape", "toggleRef.current?.focus()"] ) {
  if (!navbar.includes(invariant)) throw new Error("Missing mobile navigation accessibility invariant: " + invariant);
}

for (const invariant of ["document.documentElement", "demoSubmitting", "could not be confirmed", "setPendingDemo(null)"]) {
  if (!integrated.includes(invariant)) throw new Error("Missing UX-5 check-in/handoff invariant: " + invariant);
}

if (!validation.includes("not a WCAG compliance certification") || !validation.includes("Manual accessibility checks still required")) {
  throw new Error("UX-5 validation evidence boundary missing");
}

if (!usability.includes("5–8 participants aged 18–30") || !usability.includes("No participant sessions or findings are claimed")) {
  throw new Error("UX-5 usability plan must remain a plan without fabricated findings");
}

console.log("Phase 9 UX/accessibility checks passed.");
