import fs from "node:fs";

const [url, runId = "run-01-baseline"] = process.argv.slice(2);
if (!url) {
  console.error("Dùng: node eval/run-eval.mjs <prototype_url> [run_id]");
  process.exit(1);
}

const goldenFile = new URL("./golden-set-v1.json", import.meta.url);
const outputFile = new URL(`./${runId}.raw.json`, import.meta.url);
const { cases } = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
const results = [];

for (const c of cases) {
  const input = {
    user_query: c.user_query,
    selected_text: c.selected_text,
    page_or_context: c.page_or_context,
    retrieved_chunks: c.retrieved_chunks
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
    const missing = ["route", "answer", "citations"].filter((x) => output[x] === undefined);
    if (missing.length) throw new Error(`Output thiếu field: ${missing.join(", ")}`);
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
