import fs from "node:fs";

const [url, runId = "run-01-baseline", model, promptVersion] = process.argv.slice(2);
if (!url || !model || !promptVersion) {
  console.error("Dùng: node eval/run-eval.mjs <prototype_url> <run_id> <model> <prompt_version>");
  process.exit(1);
}
if (!/^[\w-]+$/.test(runId)) throw new Error("run_id chỉ được chứa chữ, số, _ và -.");

const goldenFile = new URL("./golden-set-v2.json", import.meta.url);
const outputFile = new URL(`./${runId}.raw.json`, import.meta.url);
const { cases } = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
const results = [];

for (const c of cases) {
  const input = {
    user_query: c.user_query,
    selected_text: c.selected_text,
    page_or_context: c.page_or_context,
    document_id: c.document_id,
    target_page: c.target_page,
    candidate_chunks: c.candidate_chunks
  };
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(60_000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const output = await response.json();
    const missing = ["route", "answer", "citations", "used_chunk_ids"].filter((x) => output[x] === undefined);
    if (missing.length) throw new Error(`Output thiếu field: ${missing.join(", ")}`);
    if (!Array.isArray(output.citations)) throw new Error("Output citations phải là array.");
    if (!Array.isArray(output.used_chunk_ids)) throw new Error("Output used_chunk_ids phải là array.");
    for (const citation of output.citations) {
      if (!citation.document_id || !Number.isInteger(citation.page) || !citation.chunk_id) {
        throw new Error("Mỗi citation phải có document_id, page và chunk_id.");
      }
    }
    results.push({
      run_id: runId,
      case_id: c.case_id,
      input,
      output,
      latency_ms: Date.now() - startedAt,
      error: null
    });
  } catch (error) {
    results.push({
      run_id: runId,
      case_id: c.case_id,
      input,
      output: null,
      latency_ms: Date.now() - startedAt,
      error: String(error)
    });
  }
  fs.writeFileSync(outputFile, JSON.stringify({
    run_id: runId,
    model,
    prompt_version: promptVersion,
    prototype_url: url,
    created_at: new Date().toISOString(),
    completed: results.length,
    total: cases.length,
    results
  }, null, 2));
  console.log(`${results.length}/${cases.length} ${c.case_id}`);
}

const failedCalls = results.filter((x) => x.error).length;
console.log(`Đã lưu ${outputFile.pathname}. Lỗi gọi: ${failedCalls}/${cases.length}.`);
if (failedCalls) process.exitCode = 1;
