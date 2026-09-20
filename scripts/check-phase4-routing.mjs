import fs from "node:fs";
const discovery=fs.readFileSync("lib/routing/discovery.ts","utf8"); const safety=fs.readFileSync("lib/safety/router.ts","utf8"); const matrix=fs.readFileSync("lib/safety/validated-matrix.ts","utf8"); const content=fs.readFileSync("lib/safety/content.ts","utf8");
for(const x of ["MAX_RESULTS = 3","no_match","change_area","change_preferences","browse_directory"]) if(!discovery.includes(x)) throw new Error("Missing discovery invariant: "+x);
if(/score|best match/i.test(discovery)) throw new Error("Discovery must not expose scoring or best-match language");
for(const x of ["automaticThirdPartyNotification:false","showImmediateSupportAction:true"]) if(!safety.includes(x)) throw new Error("Missing safety invariant: "+x);
if(!matrix.includes("requires_domain_expert_validation")) throw new Error("Safety matrix must remain explicitly unvalidated");
if(!content.includes("I need help now")||!content.includes("Χρειάζομαι βοήθεια τώρα")) throw new Error("Immediate-support action must exist in EN and EL");
console.log("Phase 4 routing/safety checks passed.");
