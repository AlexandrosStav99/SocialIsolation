import fs from "node:fs";
const create=fs.readFileSync("lib/handoff/create-request.ts","utf8");const preview=fs.readFileSync("lib/handoff/preview.ts","utf8");const withdrawal=fs.readFileSync("lib/handoff/withdrawal.ts","utf8");
for(const x of ["Explicit consent is required","optionalNoteAccepted","randomUUID","authorisedDataCategories"]) if(!create.includes(x)) throw new Error("Missing handoff invariant: "+x);
if(!preview.includes("One contact method is required")) throw new Error("Sharing Preview must require exactly one contact method");
if(!withdrawal.includes("requestDeleted:true")||!withdrawal.includes("withdrawnAt")) throw new Error("Demo withdrawal/deletion flow missing");
for(const forbidden of ["temporaryFreeText","candidateSignals","safetyRoutingState"]) if(create.includes(forbidden)) throw new Error("Contact request must not include ephemeral/safety data: "+forbidden);
console.log("Phase 6 handoff/consent checks passed.");
