import fs from "node:fs";

const taxonomy = fs.readFileSync("lib/directory/taxonomy.ts", "utf8");
const required = ["social_connection","emotional_wellbeing","family_relationships","work_unemployment","financial_basic_needs","housing_living","personal_safety","education_student","other_unsure"];
for (const topic of required) if (!taxonomy.includes(topic)) throw new Error("Missing taxonomy topic: " + topic);

const checked = JSON.parse(fs.readFileSync("data/checked-cyprus-directory.json", "utf8"));
if (!Array.isArray(checked.records)) throw new Error("Checked directory records must be an array");
if (!["research_required", "initial_checked_records"].includes(checked.status)) throw new Error("Invalid checked-directory status");
for (const record of checked.records) {
  for (const field of ["id","provider","service","informationSource","informationCheckedAt"]) {
    if (!record[field]) throw new Error("Checked record missing " + field);
  }
  if (record.integrated !== false) throw new Error("Real provider must not imply integration/partnership");
}

const demo = fs.readFileSync("data/demo-directory.ts", "utf8");
for (const phrase of ["Synthetic university demonstration record", "Demonstration"]) {
  if (!demo.includes(phrase)) throw new Error("Demo labelling missing: " + phrase);
}
if (/\bverified provider\b/i.test(demo)) throw new Error("Quality-verification claim is prohibited");

const schema = fs.readFileSync("lib/directory/schema.ts", "utf8");
for (const field of ["topics","coverage","languages","deliveryModes","contactChannels","information"]) {
  if (!schema.includes(field)) throw new Error("Directory validation missing: " + field);
}

const payloadLoader = fs.readFileSync("lib/directory/payload-demo.ts", "utf8");
for (const phrase of ["collection: \"providers\"", "collection: \"services\"", "DEMO_INFORMATION_SOURCE"]) {
  if (!payloadLoader.includes(phrase)) throw new Error("Payload-backed demo directory loader missing: " + phrase);
}

const directoryRoute = fs.readFileSync("app/api/directory/route.ts", "utf8");
for (const phrase of ["payload_postgres", "synthetic_fallback", "Demonstration Data"]) {
  if (!directoryRoute.includes(phrase)) throw new Error("Directory API source boundary missing: " + phrase);
}

const seed = fs.readFileSync("scripts/seed-demo-directory.ts", "utf8");
for (const phrase of ["provider-organisations", "providers", "services", "DEMO_INFORMATION_SOURCE"]) {
  if (!seed.includes(phrase)) throw new Error("Synthetic directory seed missing: " + phrase);
}

console.log("Phase 2 directory checks passed.");
