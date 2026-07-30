import fs from "node:fs";

const file = new URL("./golden-set-v1.json", import.meta.url);
const { cases = [] } = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const required = [
  "case_id", "source_type", "source_ref", "case_group", "rarity",
  "user_query", "selected_text", "page_or_context", "expected_route",
  "must_include", "must_not_include", "scoring_notes", "author", "status"
];
const count = (field, value) => cases.filter((c) => c[field] === value).length;

if (cases.length < 20) errors.push(`Chỉ có ${cases.length}/20 case.`);
if (new Set(cases.map((c) => c.case_id)).size !== cases.length) errors.push("Trùng case_id.");
for (const c of cases) {
  for (const field of required) {
    if (c[field] === undefined || c[field] === null || c[field] === "") {
      errors.push(`${c.case_id || "unknown"} thiếu ${field}.`);
    }
  }
}

const normal = count("case_group", "normal");
const rare = count("case_group", "rare");
const dataCases = cases.filter((c) => ["real_chatlog", "adapted_chatlog"].includes(c.source_type)).length;
if (normal < 8 || normal > 10) errors.push(`Case thường phải 8–10, hiện có ${normal}.`);
if (rare < 2 || rare > 4) errors.push(`Case hiếm phải 2–4, hiện có ${rare}.`);
if (dataCases < 10) errors.push(`Case từ/phát triển từ data phải ≥10, hiện có ${dataCases}.`);
for (const hardClass of ["source", "ambiguity", "scope", "domain"]) {
  const total = count("hard_class", hardClass);
  if (total < 2) errors.push(`Lớp ${hardClass} chỉ có ${total}/2 case.`);
}

const summary = {
  total: cases.length,
  groups: Object.fromEntries(["normal", "hard", "rare"].map((x) => [x, count("case_group", x)])),
  hard_classes: Object.fromEntries(["source", "ambiguity", "scope", "domain"].map((x) => [x, count("hard_class", x)])),
  source_types: Object.fromEntries(["real_chatlog", "adapted_chatlog", "synthetic"].map((x) => [x, count("source_type", x)])),
  routes: Object.fromEntries(["PASS", "RECOVER", "CLARIFY", "ESCALATE"].map((x) => [
    x, cases.filter((c) => c.expected_route.includes(x)).length
  ]))
};

console.log(JSON.stringify(summary, null, 2));
if (errors.length) {
  console.error(`\nINVALID:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("\nVALID: Golden set đạt yêu cầu cấu trúc.");
