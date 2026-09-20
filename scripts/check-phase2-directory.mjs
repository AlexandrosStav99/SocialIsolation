import fs from "node:fs";

const taxonomy = fs.readFileSync("lib/directory/taxonomy.ts", "utf8");
const required = ["social_connection","emotional_wellbeing","family_relationships","work_unemployment","financial_basic_needs","housing_living","personal_safety","education_student","other_unsure"];
for (const topic of required) if (!taxonomy.includes(topic)) throw new Error("Missing taxonomy topic: " + topic);

const checked = JSON.parse(fs.readFileSync("data/checked-cyprus-directory.json", "utf8"));
if (!Array.isArray(checked.records)) throw new Error("Checked directory records must be an array");
if (checked.status !== "research_required") throw new Error("Real directory must not be presented as checked before research");

const demo = fs.readFileSync("data/demo-directory.ts", "utf8");
for (const phrase of ["Synthetic university demonstration record", "Demonstration"]) {
  if (!demo.includes(phrase)) throw new Error("Demo labelling missing: " + phrase);
}
if (/\bverified provider\b/i.test(demo)) throw new Error("Quality-verification claim is prohibited");

const schema = fs.readFileSync("lib/directory/schema.ts", "utf8");
for (const field of ["topics","coverage","languages","deliveryModes","contactChannels","information"]) {
  if (!schema.includes(field)) throw new Error("Directory validation missing: " + field);
}

console.log("Phase 2 directory checks passed.");
