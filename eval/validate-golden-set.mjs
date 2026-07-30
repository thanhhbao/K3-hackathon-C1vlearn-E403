import fs from "node:fs";

const file = new URL("./golden-set-v2.json", import.meta.url);
const chatlogFile = new URL("../data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv", import.meta.url);
const { meta = {}, cases = [] } = JSON.parse(fs.readFileSync(file, "utf8"));
const sourceTurnIds = new Set(
  [...fs.readFileSync(chatlogFile, "utf8").matchAll(/\bT\d{4}\b/g)].map((match) => match[0])
);
const errors = [];
const required = [
  "case_id", "source_type", "source_ref", "case_group", "rarity",
  "user_query", "selected_text", "page_or_context", "document_id", "target_page",
  "candidate_chunks", "expected_context_chunk_ids", "expected_route",
  "allowed_citations", "requires_exact_page_citation", "evaluation_focus",
  "must_include", "must_not_include", "scoring_notes", "author", "status"
];
const count = (field, value) => cases.filter((c) => c[field] === value).length;

if (meta.version !== 2) errors.push(`Golden set phải là version 2, hiện là ${meta.version}.`);
if (cases.length < 20) errors.push(`Chỉ có ${cases.length}/20 case.`);
if (new Set(cases.map((c) => c.case_id)).size !== cases.length) errors.push("Trùng case_id.");
for (const c of cases) {
  for (const field of required) {
    if (c[field] === undefined || c[field] === null || c[field] === "") {
      errors.push(`${c.case_id || "unknown"} thiếu ${field}.`);
    }
  }
  if (!Number.isInteger(c.target_page)) errors.push(`${c.case_id} target_page không phải số nguyên.`);
  for (const ref of c.source_ref.split(",")) {
    if (!sourceTurnIds.has(ref)) errors.push(`${c.case_id} không tìm thấy source_ref ${ref} trong chatlog.`);
  }
  const candidateIds = c.candidate_chunks.map((chunk) => chunk.id);
  if (new Set(candidateIds).size !== candidateIds.length) errors.push(`${c.case_id} trùng candidate chunk id.`);
  for (const chunk of c.candidate_chunks ?? []) {
    if (!chunk.id || !chunk.document_id || chunk.page === undefined || !chunk.text) {
      errors.push(`${c.case_id} có candidate_chunk thiếu metadata.`);
    }
  }
  for (const expectedId of c.expected_context_chunk_ids ?? []) {
    if (!candidateIds.includes(expectedId)) errors.push(`${c.case_id} expected chunk ${expectedId} không có trong candidate_chunks.`);
  }
  for (const citation of c.allowed_citations ?? []) {
    if (!citation.kind || !citation.document_id || !Number.isInteger(citation.page) || !citation.chunk_id) {
      errors.push(`${c.case_id} có allowed_citation thiếu document/page/chunk.`);
    }
    if (citation.kind === "retrieved_chunk" && !candidateIds.includes(citation.chunk_id)) {
      errors.push(`${c.case_id} citation ${citation.chunk_id} không có trong candidate_chunks.`);
    }
  }
  if (c.requires_exact_page_citation) {
    if (!c.allowed_citations?.length) errors.push(`${c.case_id} cần cite đúng trang nhưng allowed_citations rỗng.`);
    for (const citation of c.allowed_citations ?? []) {
      if (citation.document_id !== c.document_id || citation.page !== c.target_page) {
        errors.push(`${c.case_id} cho phép citation sai document/page mục tiêu.`);
      }
    }
  }
  if (c.expected_route.includes("PASS") && !c.expected_context_chunk_ids.length) {
    errors.push(`${c.case_id} route PASS nhưng không có expected_context_chunk_ids.`);
  }
  if (c.expected_route.includes("RECOVER")) {
    if (c.expected_context_chunk_ids.length) errors.push(`${c.case_id} route RECOVER vẫn có expected retrieved chunk.`);
    if (!c.allowed_citations.some((citation) => citation.kind === "selected_text")) {
      errors.push(`${c.case_id} route RECOVER thiếu selected_text citation.`);
    }
  }
}

const normal = count("case_group", "normal");
const rare = count("case_group", "rare");
const dataCases = cases.filter((c) => ["real_chatlog", "adapted_chatlog"].includes(c.source_type)).length;
const exactPageCases = cases.filter((c) => c.requires_exact_page_citation).length;
const distractorCases = cases.filter((c) => {
  const allowedIds = new Set(c.allowed_citations.map((citation) => citation.chunk_id));
  return c.candidate_chunks.some((chunk) =>
    !allowedIds.has(chunk.id)
    && (chunk.document_id !== c.document_id || chunk.page !== c.target_page)
  );
}).length;
if (normal < 8 || normal > 10) errors.push(`Case thường phải 8–10, hiện có ${normal}.`);
if (rare < 2 || rare > 4) errors.push(`Case hiếm phải 2–4, hiện có ${rare}.`);
if (dataCases < 10) errors.push(`Case từ/phát triển từ data phải ≥10, hiện có ${dataCases}.`);
if (exactPageCases < 10) errors.push(`Case bắt buộc cite đúng trang phải ≥10, hiện có ${exactPageCases}.`);
if (distractorCases < 6) errors.push(`Case có nguồn nhiễu/sai trang phải ≥6, hiện có ${distractorCases}.`);
for (const hardClass of ["source", "ambiguity", "scope", "domain"]) {
  const total = count("hard_class", hardClass);
  if (total < 2) errors.push(`Lớp ${hardClass} chỉ có ${total}/2 case.`);
}

const summary = {
  total: cases.length,
  groups: Object.fromEntries(["normal", "hard", "rare"].map((x) => [x, count("case_group", x)])),
  hard_classes: Object.fromEntries(["source", "ambiguity", "scope", "domain"].map((x) => [x, count("hard_class", x)])),
  source_types: Object.fromEntries(["real_chatlog", "adapted_chatlog", "synthetic"].map((x) => [x, count("source_type", x)])),
  page_priority: {
    exact_page_citation_cases: exactPageCases,
    distractor_cases: distractorCases
  },
  traceable_source_cases: cases.filter((c) =>
    c.source_ref.split(",").every((ref) => sourceTurnIds.has(ref))
  ).length,
  routes: Object.fromEntries(["PASS", "RECOVER", "CLARIFY", "ESCALATE"].map((x) => [
    x, cases.filter((c) => c.expected_route.includes(x)).length
  ]))
};

console.log(JSON.stringify(summary, null, 2));
if (errors.length) {
  console.error(`\nINVALID:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("\nVALID: Golden set đạt cấu trúc và độ phủ page-priority.");
