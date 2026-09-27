import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const protocol = read("docs/MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md");
if (!protocol.includes("Status: **protocol only**")) {
  throw new Error("Manual accessibility protocol must remain explicitly protocol-only");
}
for (let id = 1; id <= 8; id += 1) {
  const marker = "A11Y-" + String(id).padStart(2, "0");
  if (!protocol.includes(marker)) throw new Error("Manual accessibility protocol missing " + marker);
}

const checklist = read("docs/PHASE-9-ACCESSIBILITY-CHECKLIST.md");
if (/^- \[[xX]\]/m.test(checklist)) {
  throw new Error("Manual accessibility checklist must not be committed as complete without real evidence");
}
if (!checklist.includes("Manual items are deliberately not marked complete by CI")) {
  throw new Error("Manual/automated accessibility evidence boundary is missing");
}

const record = read("docs/ACCESSIBILITY-MANUAL-RUN-RECORD.md");
for (const marker of [
  "Commit SHA / deployed build",
  "Browser and version",
  "Assistive technology and version",
  "Evidence location",
  "Finding ID",
  "Severity",
  "Retest record",
  "Manual gate decision",
]) {
  if (!record.includes(marker)) throw new Error("Accessibility evidence template missing: " + marker);
}
for (let id = 1; id <= 8; id += 1) {
  const marker = "A11Y-" + String(id).padStart(2, "0");
  if (!record.includes(marker)) throw new Error("Accessibility evidence template missing " + marker);
}
if (/Result:\s*(Pass|Fail|Blocked)/.test(record)) {
  throw new Error("Blank accessibility evidence template must not contain a pre-filled result");
}

const navbar = read("components/Navbar.tsx");
for (const marker of ['href="#main-content"', "Skip to main content", "focus:not-sr-only"]) {
  if (!navbar.includes(marker)) throw new Error("Keyboard skip-link marker missing: " + marker);
}

for (const path of [
  "app/(frontend)/page.tsx",
  "app/(frontend)/about/page.tsx",
  "components/check-in/IntegratedCheckIn.tsx",
]) {
  const source = read(path);
  if (!source.includes('id="main-content"') || !source.includes("tabIndex={-1}")) {
    throw new Error("Stable keyboard skip target missing from " + path);
  }
}

const tests = read("tests/accessibility.spec.ts");
for (const marker of [
  "skip link is the first keyboard stop",
  'getByRole("link", { name: "Skip to main content" })',
  'locator("#main-content")',
]) {
  if (!tests.includes(marker)) throw new Error("Accessibility browser evidence missing: " + marker);
}

const execution = read("docs/PRODUCTION-ACCESSIBILITY-EXECUTION.md");
for (const forbidden of [
  "has passed manual accessibility testing",
  "is WCAG 2.2 AA conformant",
]) {
  if (!execution.includes("not defensible") && execution.includes(forbidden)) {
    throw new Error("Accessibility execution guide overclaims validation");
  }
}
if (!execution.includes("manual accessibility validation remains not complete")) {
  throw new Error("Accessibility execution guide must preserve the manual validation boundary");
}

console.log("Production accessibility execution-readiness checks passed.");
