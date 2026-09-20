import fs from "node:fs";
const content=fs.readFileSync("lib/i18n/content.ts","utf8");const chat=fs.readFileSync("components/check-in/CheckInChat.tsx","utf8");const checklist=fs.readFileSync("docs/PHASE-9-ACCESSIBILITY-CHECKLIST.md","utf8");
for(const key of ["title","status","conversation","input","placeholder","send","latest","helpNow","empty","loading","noMatch"]) if(!content.includes(key)) throw new Error("Missing bilingual UX state: "+key);
for(const x of ['aria-live="polite"','aria-relevant="additions text"']) if(!chat.includes(x)) throw new Error("Missing screen-reader log behaviour: "+x);
if(!checklist.includes("WCAG 2.2 AA")||!checklist.includes("not a compliance certification")) throw new Error("Accessibility claim boundary missing");
console.log("Phase 9 UX/accessibility checks passed.");
