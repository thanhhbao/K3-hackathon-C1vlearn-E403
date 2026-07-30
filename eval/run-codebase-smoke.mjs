import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const clean = (html) => html
  .replace(/<br\s*\/?>/gi, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const mark = (value) => value ? "PASS" : "FAIL";

export function runCodebaseSmoke(root = path.resolve(fileURLToPath(new URL("..", import.meta.url)))) {
  const appPath = path.join(root, "codebase", "app.js");
  const suitePath = path.join(root, "eval", "codebase-smoke-v1.json");
  const resultDir = path.join(root, "eval", "results");
  const app = fs.readFileSync(appPath, "utf8");
  const suite = JSON.parse(fs.readFileSync(suitePath, "utf8"));
  const templates = [...app.matchAll(/aiHtml\s*=\s*`([\s\S]*?)`;/g)].map((match) => clean(match[1]));
  if (templates.length !== 3) throw new Error(`Cần đúng 3 nhánh aiHtml, hiện có ${templates.length}.`);

  const audit = {
    source_sha256: crypto.createHash("sha256").update(app).digest("hex"),
    ai_call: /\bfetch\s*\(|openai|anthropic|generativeai|gemini/i.test(app),
    hardcoded_answer: /setTimeout\s*\(|aiHtml\s*=\s*`/.test(app),
    fixed_page_12: /contextPage\s*=\s*12|TRANG 12|Trang 12/.test(app),
    structured_contract: /used_chunk_ids|candidate_chunks|target_page|document_id/.test(app)
  };

  const rows = suite.cases.map((test) => {
    const lower = test.user_query.toLowerCase();
    const branch = test.with_context ? 0 : lower.includes("trang 12") || lower.includes("missing") ? 1 : 2;
    const answer = templates[branch];
    const actualRoute = test.with_context ? "PASS" : "CLARIFY";
    const citationPage = test.with_context ? Number(answer.match(/Trích dẫn:\s*Trang\s*(\d+)/i)?.[1]) : null;
    const route = test.expected_route.includes(actualRoute);
    const citation = !test.requires_citation || citationPage === test.target_page;
    const pagePriority = !test.requires_page_priority || audit.structured_contract;
    const groundedness = test.must_not_include.every((term) => !answer.toLowerCase().includes(term.toLowerCase()));
    const behavior = test.must_include.every((term) => answer.toLowerCase().includes(term.toLowerCase()));
    return {
      case_id: test.case_id,
      case_group: test.case_group,
      expected_route: test.expected_route.join("|"),
      actual_route: actualRoute,
      citation_page: citationPage ?? "",
      route_correctness: mark(route),
      citation_exact_page: mark(citation),
      page_priority: mark(pagePriority),
      groundedness: mark(groundedness),
      behavior_correctness: mark(behavior),
      case_pass: mark(route && citation && pagePriority && groundedness && behavior),
      failure_label: [
        !route && "WRONG_ROUTE",
        !pagePriority && "NO_PAGE_PRIORITY_TRACE",
        !groundedness && "UNSUPPORTED_CLAIM",
        !behavior && "MISSING_BEHAVIOR"
      ].filter(Boolean).join("|"),
      raw_output: answer
    };
  });

  fs.mkdirSync(resultDir, { recursive: true });
  const columns = Object.keys(rows[0]);
  fs.writeFileSync(
    path.join(resultDir, "codebase-smoke-v1.csv"),
    `${columns.join(",")}\n${rows.map((row) => columns.map((key) => csv(row[key])).join(",")).join("\n")}\n`
  );

  const passed = rows.filter((row) => row.case_pass === "PASS").length;
  const report = `# Audit codebase và smoke test

Nguồn: \`codebase/app.js\`  
SHA-256: \`${audit.source_sha256}\`

## Contract audit

| Điều kiện | Kết quả |
|---|---|
| Có lời gọi AI/API thật | ${audit.ai_call ? "Có" : "Không"} |
| Câu trả lời hardcode | ${audit.hardcoded_answer ? "Có" : "Không"} |
| Context/citation cố định Trang 12 | ${audit.fixed_page_12 ? "Có" : "Không"} |
| Có contract document/page/candidate/used chunks | ${audit.structured_contract ? "Có" : "Không"} |

## Smoke result

| Case | Nhóm | Route | Citation | Page priority | Grounded | Pass |
|---|---|---|---|---|---|---|
${rows.map((row) => `| ${row.case_id} | ${row.case_group} | ${row.route_correctness} | ${row.citation_exact_page} | ${row.page_priority} | ${row.groundedness} | ${row.case_pass} |`).join("\n")}

Kết quả: **${passed}/${rows.length} (${(passed / rows.length * 100).toFixed(1)}%)**.

Đây là smoke test của Mock tĩnh, không phải lượt golden set 20 case và không đáp ứng điều kiện “AI thật” của CP3/R5.
`;
  fs.writeFileSync(path.join(resultDir, "codebase-audit.md"), report);
  return { audit, passed, total: rows.length, rows };
}

if (typeof process !== "undefined" && process.argv?.[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runCodebaseSmoke();
  console.log(`Codebase smoke: ${result.passed}/${result.total}`);
}
