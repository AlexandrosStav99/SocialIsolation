import fs from "node:fs";
const service=fs.readFileSync("lib/ai/service.ts","utf8");const provider=fs.readFileSync("lib/ai/openai-provider.ts","utf8");const privacy=fs.readFileSync("lib/ai/privacy.ts","utf8");const validation=fs.readFileSync("lib/ai/validation.ts","utf8");
for(const x of ["AI_TIMEOUT_MS=5000","deterministicAiFallback","validateAiConversationOutput","minimiseFreeTextForAi"]) if(!service.includes(x)) throw new Error("Missing AI resilience invariant: "+x);
if(!provider.includes("store:false")) throw new Error("OpenAI storage must be disabled");
for(const forbidden of ["preferredName","email","phone","contactRequestId"]) if(!privacy.includes(forbidden)) throw new Error("Missing identity boundary: "+forbidden);
if(!validation.includes("isSupportTopic")) throw new Error("AI output must be validated against application taxonomy");
if(/routeSafety|discoverServices/.test(provider+service)) throw new Error("AI layer must not call safety or service-routing decisions");
console.log("Phase 5 AI checks passed.");
