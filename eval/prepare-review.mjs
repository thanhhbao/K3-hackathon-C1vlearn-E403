import fs from "node:fs";
import path from "node:path";

const [runPath] = process.argv.slice(2);
if (!runPath) {
  console.error("Dùng: node eval/prepare-review.mjs <run.raw.json>");
  process.exit(1);
}

const base = runPath.replace(/\.raw\.json$/, "");
const run = JSON.parse(fs.readFileSync(runPath, "utf8"));
const structural = JSON.parse(fs.readFileSync(`${base}.structural.json`, "utf8"));
const golden = JSON.parse(fs.readFileSync(new URL("./golden-set-v2.json", import.meta.url), "utf8"));
const cases = new Map(golden.cases.map((c) => [c.case_id, c]));
const scores = new Map(structural.scores.map((score) => [score.case_id, score]));
const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const mark = (value) => value === true ? "PASS" : value === false ? "FAIL" : "TODO";
const columns = [
  "run_id", "model", "prompt_version", "case_id", "source_type", "case_group", "hard_class", "expected_route",
  "actual_route", "call_status", "latency_ms", "raw_output", "page_priority",
  "citation_exact_page", "distractor_rejection", "groundedness", "route_correctness",
  "recovery_correctness", "safety_domain", "answer_size", "case_pass",
  "reviewer_1", "reviewer_2", "failure_label", "notes"
];

const rows = run.results.map((result) => {
  const c = cases.get(result.case_id) ?? {};
  const score = scores.get(result.case_id) ?? {};
  return {
    run_id: run.run_id,
    model: run.model,
    prompt_version: run.prompt_version,
    case_id: result.case_id,
    source_type: c.source_type,
    case_group: c.case_group,
    hard_class: c.hard_class,
    expected_route: c.expected_route?.join("|"),
    actual_route: result.output?.route,
    call_status: result.error ? "ERROR" : "OK",
    latency_ms: result.latency_ms,
    raw_output: result.output ? JSON.stringify(result.output) : result.error,
    page_priority: mark(score.page_priority),
    citation_exact_page: mark(score.citation_exact_page),
    distractor_rejection: mark(score.distractor_rejection),
    groundedness: "TODO",
    route_correctness: mark(score.route_correctness),
    recovery_correctness: "TODO",
    safety_domain: "TODO",
    answer_size: "TODO",
    case_pass: "TODO",
    reviewer_1: "",
    reviewer_2: "",
    failure_label: result.error ? "CALL_ERROR" : "",
    notes: ""
  };
});

const csv = [
  columns.join(","),
  ...rows.map((row) => columns.map((column) => quote(row[column])).join(","))
].join("\n");
const outputPath = path.resolve(`${base}.review.csv`);
fs.writeFileSync(outputPath, `${csv}\n`);
console.log(`Đã tạo bảng review ${outputPath}`);
