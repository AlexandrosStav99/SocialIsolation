import { execFileSync } from "node:child_process";

const allowedAdvisories = new Set([
  "GHSA-c2j3-45gr-mqc4",
  "GHSA-cmwh-pvxp-8882",
  "GHSA-vxr8-fq34-vvx9",
  "GHSA-55q2-fjhq-7xh7",
  "GHSA-67mh-4wv8-2f99",
]);

let report;
try {
  report = JSON.parse(execFileSync("npm", ["audit", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
} catch (error) {
  const stdout = error?.stdout?.toString?.() ?? "";
  if (!stdout) throw error;
  report = JSON.parse(stdout);
}

const unknown = [];
for (const [name, vulnerability] of Object.entries(report.vulnerabilities ?? {})) {
  const vias = Array.isArray(vulnerability.via) ? vulnerability.via : [];
  for (const via of vias) {
    if (typeof via !== "object" || !via.url) continue;
    const advisory = via.url.split("/").pop();
    if (!allowedAdvisories.has(advisory)) {
      unknown.push({ name, advisory, severity: via.severity, title: via.title });
    }
  }
}

if (unknown.length) {
  console.error("Unreviewed dependency vulnerabilities detected:", JSON.stringify(unknown, null, 2));
  process.exit(1);
}

console.log("Dependency audit contains only explicitly reviewed upstream advisories.");
