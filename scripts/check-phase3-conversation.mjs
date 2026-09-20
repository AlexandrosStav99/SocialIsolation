import fs from "node:fs";

const engine = fs.readFileSync("lib/conversation/engine.ts", "utf8");
const types = fs.readFileSync("lib/conversation/types.ts", "utf8");
const prompts = fs.readFileSync("lib/conversation/prompts.ts", "utf8");
const summary = fs.readFileSync("lib/conversation/summary.ts", "utf8");

for (const stage of ["age_gate","primary_topic","secondary_topics","optional_context","service_area","preferences","review","complete","ended"]) {
  if (!types.includes(stage)) throw new Error("Missing conversation stage: " + stage);
}
for (const invariant of ["MAX_OPTIONAL_CONTEXT_LENGTH = 500","MAX_SECONDARY_TOPICS = 2","Primary topic cannot also be secondary","Conversation is already closed"]) {
  if (!engine.includes(invariant)) throw new Error("Missing conversation invariant: " + invariant);
}
if (!prompts.includes("Please do not include names, contact details")) throw new Error("Missing free-text privacy warning");
if (!prompts.includes("Μην συμπεριλάβεις ονόματα")) throw new Error("Missing Greek free-text privacy warning");
if (summary.includes("optionalFreeText")) throw new Error("Structured summary must not contain optional free text");
if (!engine.includes('optionalFreeText: undefined')) throw new Error("Raw optional context must be cleared on completion/end");

console.log("Phase 3 conversation checks passed.");
