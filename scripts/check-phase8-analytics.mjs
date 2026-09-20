import fs from "node:fs";
const domain=fs.readFileSync("lib/domain/data-boundaries.ts","utf8");const aggregate=fs.readFileSync("lib/analytics/aggregate.ts","utf8");const demo=fs.readFileSync("lib/analytics/demo.ts","utf8");const privacy=fs.readFileSync("lib/privacy/analytics.ts","utf8");
const block=domain.slice(domain.indexOf("export type AnonymousAnalyticsEvent"),domain.indexOf("export type ContactRequest")).replace(/\/\/.*$/gm,"");
for(const forbidden of ["sessionId","requestId","userId","contactDetail","freeText"]) if(block.includes(forbidden)) throw new Error("Anonymous analytics contains forbidden identifier: "+forbidden);
if(!aggregate.includes("MINIMUM_AGGREGATE_SAMPLE=5")||!aggregate.includes("suppressed")) throw new Error("Minimum-sample suppression missing");
if(!demo.includes('"Demonstration Data"')) throw new Error("Synthetic analytics must be labelled Demonstration Data");
if(!privacy.includes("assertAnonymousAnalyticsBoundary")) throw new Error("Anonymous event boundary guard missing");
console.log("Phase 8 privacy-safe analytics checks passed.");
