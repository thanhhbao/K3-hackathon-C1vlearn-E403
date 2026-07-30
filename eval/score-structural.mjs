import fs from "node:fs";
import path from "node:path";

const [runPath] = process.argv.slice(2);
if (!runPath) {
  console.error("Dùng: node eval/score-structural.mjs <run.raw.json>");
  process.exit(1);
}

const golden = JSON.parse(fs.readFileSync(new URL("./golden-set-v2.json", import.meta.url), "utf8"));
const run = JSON.parse(fs.readFileSync(runPath, "utf8"));
const cases = new Map(golden.cases.map((c) => [c.case_id, c]));
const sameCitation = (a, b) =>
  a.kind === b.kind &&
  a.document_id === b.document_id &&
  a.page === b.page &&
  a.chunk_id === b.chunk_id;

const scores = run.results.map((result) => {
  const c = cases.get(result.case_id);
  if (!c || result.error || !result.output) {
    return {
      case_id: result.case_id,
      route_correctness: false,
      page_priority: false,
      citation_exact_page: false,
      distractor_rejection: false,
      structural_pass: false,
      error: result.error || "Không tìm thấy case/output"
    };
  }

  const output = result.output;
  const used = Array.isArray(output.used_chunk_ids) ? output.used_chunk_ids : [];
  const citations = Array.isArray(output.citations) ? output.citations : [];
  const expectedIds = c.expected_context_chunk_ids;
  const allowedChunkIds = c.allowed_citations.map((citation) => citation.chunk_id);
  const distractorIds = c.candidate_chunks
    .filter((chunk) =>
      (chunk.document_id !== c.document_id || chunk.page !== c.target_page) &&
      !allowedChunkIds.includes(chunk.id)
    )
    .map((chunk) => chunk.id);

  const route = c.expected_route.includes(output.route);
  const exactCitation = !c.requires_exact_page_citation || (
    citations.length > 0 &&
    citations.every((citation) => c.allowed_citations.some((allowed) => sameCitation(citation, allowed)))
  );
  const distractorRejection =
    used.every((id) => !distractorIds.includes(id)) &&
    citations.every((citation) => !distractorIds.includes(citation.chunk_id));
  const pagePriority = output.route === "PASS"
    ? expectedIds.length > 0 && expectedIds.some((id) => used.includes(id))
    : output.route === "RECOVER"
      ? used.length === 0 && citations.some((citation) => citation.kind === "selected_text")
      : distractorRejection;

  return {
    case_id: c.case_id,
    route_correctness: route,
    page_priority: pagePriority,
    citation_exact_page: exactCitation,
    distractor_rejection: distractorRejection,
    structural_pass: route && pagePriority && exactCitation && distractorRejection,
    error: null
  };
});

const passed = scores.filter((x) => x.structural_pass).length;
const report = {
  run_id: run.run_id,
  total: scores.length,
  structural_passed: passed,
  structural_pass_rate: scores.length ? passed / scores.length : 0,
  note: "Structural pass chưa thay chấm groundedness/safety/ngữ nghĩa bằng người.",
  scores
};
const outputPath = path.resolve(path.dirname(runPath), `${path.basename(runPath, ".raw.json")}.structural.json`);
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Structural pass: ${passed}/${scores.length}. Đã lưu ${outputPath}`);
