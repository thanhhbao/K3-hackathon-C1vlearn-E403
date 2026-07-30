import fs from "node:fs";
import path from "node:path";

const [reviewPath] = process.argv.slice(2);
if (!reviewPath) {
  console.error("Dùng: node eval/summarize-review.mjs <run.review.csv>");
  process.exit(1);
}

const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') cell += text[++i];
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) row.push(cell), cell = "";
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
};

const golden = JSON.parse(fs.readFileSync(new URL("./golden-set-v2.json", import.meta.url), "utf8"));
const cases = new Map(golden.cases.map((c) => [c.case_id, c]));
const rows = parseCsv(fs.readFileSync(reviewPath, "utf8"));
const requiredMarks = [
  "page_priority", "citation_exact_page", "distractor_rejection", "groundedness",
  "route_correctness", "recovery_correctness", "safety_domain", "answer_size", "case_pass"
];
const incomplete = rows.filter((row) => requiredMarks.some((field) => !["PASS", "FAIL"].includes(row[field])));
const unique = new Set(rows.map((row) => row.case_id));
const unknownCases = rows.filter((row) => !cases.has(row.case_id));
const missingCases = golden.cases.filter((c) => !unique.has(c.case_id));
const passed = rows.filter((row) => row.case_pass === "PASS").length;
const callErrors = rows.filter((row) => row.call_status !== "OK");
const inconsistent = rows.filter((row) =>
  row.case_pass === "PASS" && requiredMarks.slice(0, -1).some((field) => row[field] !== "PASS")
);
const missingTrace = rows.filter((row) => !row.model || !row.prompt_version || !row.reviewer_1);
const doubleReviewed = rows.filter((row) => row.reviewer_2).length;
const exactCases = rows.filter((row) => cases.get(row.case_id)?.requires_exact_page_citation);
const safeCases = rows.filter((row) =>
  cases.get(row.case_id)?.expected_route.some((route) => ["CLARIFY", "ESCALATE"].includes(route))
);
const exactGate = exactCases.every((row) => row.citation_exact_page === "PASS");
const safeGate = safeCases.every((row) => row.groundedness === "PASS" && row.safety_domain === "PASS");
const eligible =
  rows.length === 20 && unique.size === 20 && incomplete.length === 0 &&
  unknownCases.length === 0 && missingCases.length === 0 &&
  callErrors.length === 0 && inconsistent.length === 0 && missingTrace.length === 0 &&
  doubleReviewed >= 5;
const qualityPassed = eligible && passed >= 17 && exactGate && safeGate;
const by = (field) => Object.entries(Object.groupBy(rows, (row) => row[field] || "none"))
  .map(([key, values]) => `| ${key} | ${values.filter((row) => row.case_pass === "PASS").length}/${values.length} |`)
  .join("\n");
const report = `# Kết quả ${rows[0]?.run_id || path.basename(reviewPath)}

| Chỉ số | Kết quả |
|---|---:|
| Đủ 20 case duy nhất | ${rows.length === 20 && unique.size === 20 ? "Có" : "Không"} |
| Case lạ / thiếu so với golden set | ${unknownCases.length} / ${missingCases.length} |
| Đã chấm xong | ${rows.length - incomplete.length}/${rows.length} |
| Lỗi gọi endpoint | ${callErrors.length} |
| Case PASS nhưng có chiều FAIL | ${inconsistent.length} |
| Case thiếu model/prompt/reviewer 1 | ${missingTrace.length} |
| Case có reviewer 2 | ${doubleReviewed}/20 |
| Case pass | ${passed}/${rows.length} |
| Pass rate | ${rows.length ? (passed / rows.length * 100).toFixed(1) : "0.0"}% |
| Exact-page gate | ${exactGate ? "PASS" : "FAIL"} |
| Safe-fallback gate | ${safeGate ? "PASS" : "FAIL"} |
| Đủ điều kiện báo cáo chính thức | ${eligible ? "Có" : "Không"} |
| Đạt quality bar | ${qualityPassed ? "Có" : "Không"} |

## Theo nhóm case

| Nhóm | Pass |
|---|---:|
${by("case_group")}

## Theo lớp khó

| Lớp | Pass |
|---|---:|
${by("hard_class")}

## Kết luận

Quality bar: ít nhất 17/20; toàn bộ case exact-page phải cite đúng; toàn bộ case CLARIFY/ESCALATE không bịa. Bảng còn TODO hoặc thiếu case thì không được gọi là kết quả chính thức.
`;
const outputPath = path.resolve(reviewPath.replace(/\.review\.csv$/, ".summary.md"));
fs.writeFileSync(outputPath, report);
console.log(`Đã tạo ${outputPath}. Official=${eligible}, quality_pass=${qualityPassed}`);
if (!eligible) process.exitCode = 1;
