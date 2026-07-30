# Eval — Context Rescue

## Trạng thái

- Golden set: `golden-set-v2.json` — **20 case, draft chờ review chéo**, đã kiểm page-priority.
- Báo cáo kiểm máy: `golden-set-check.md`.
- Candidate pool: `candidate-pool.csv` — 30 ứng viên đã mining.
- Audit số evidence: `evidence-audit.md` — chưa tái lập được số 237/1.261.
- Mẫu kết quả: `run-template.csv`.
- Validator cấu trúc: `validate-golden-set.mjs`.
- Runner gọi endpoint prototype: `run-eval.mjs`.
- Structural scorer cho đúng trang/citation: `score-structural.mjs`.
- Tạo bảng để người chấm bổ sung điểm ngữ nghĩa: `prepare-review.mjs`.
- Tổng hợp pass rate và quality gate: `summarize-review.mjs`.
- Checklist review golden set: `golden-set-review.csv`.
- Trace lần chuẩn bị chưa có endpoint: `results/run-00-blocked.csv`.
- Calibration trên năm output Tutor cũ: `calibration-current-tutor.md` — 3/5 pass nháp, chờ hai người xác nhận.
- Lượt eval prototype chính thức: **chưa chạy**.

Lý do chưa chạy: workspace chưa có `codebase/`, prompt, endpoint AI hoặc biến môi trường API. Không dùng output tự tạo thay cho AI call thật.

`results/run-00-blocked.csv` có đủ 20 `case_id` nhưng tất cả là `NOT_RUN`. Tệp này ghi lại blocker, không phải lượt eval được tính điểm.

## Cơ cấu hiện tại

| Thành phần | Số lượng |
|---|---:|
| Tổng case | 20 |
| Case thường | 8 |
| Case khó | 8 |
| Case hiếm | 4 |
| Real chatlog | 15 |
| Phát triển từ chatlog | 5 |
| Synthetic không có nguồn data | 0 |
| PASS | 5 |
| RECOVER | 5 |
| CLARIFY | 5 |
| ESCALATE | 5 |
| Case bắt buộc cite đúng document + page | 10 |
| Case có chunk nhiễu/sai tài liệu/sai trang | ≥6 |

Bốn lớp chỗ khó đều có ít nhất hai case; case rare có thể đồng thời thuộc một lớp khó.

## Phương pháp mining

1. Ghép student/tutor theo `turn_id`.
2. Đọc các nhóm có selected text giàu thông tin, citation, từ chối do không tìm thấy, đánh giá xuống, typo và yêu cầu vượt phạm vi.
3. Tạo candidate pool 30 lượt.
4. Loại case trùng trigger, case cần nguồn ngoài data pack và case không phù hợp input prototype.
5. Giữ 20 case theo cơ cấu rubric.
6. Thêm chunk cùng số trang ở tài liệu khác hoặc trang lân cận để đo page-priority.
7. Viết expected route, context chunk, citation, must-have và must-not trước khi có output prototype.

Rating chỉ được dùng để ưu tiên đọc, không dùng làm ground truth.

## Quality bar đề xuất

> Đạt ít nhất 17/20; 100% case PASS/RECOVER cite đúng document + page; 100% case thiếu/xung đột nguồn không bịa thông tin hoặc citation.

Quality bar chỉ trở thành chính thức sau khi cả nhóm đồng thuận và ghi vào `spec.md` trước 23:59 ngày 1. Không hạ bar sau khi xem kết quả.

## Cách xác minh golden set

```powershell
node eval/validate-golden-set.mjs
```

Validator kiểm tra:

- Tối thiểu 20 case.
- `case_id` duy nhất và đủ trường bắt buộc.
- 8–10 case thường.
- 2–4 case hiếm.
- Ít nhất 10 case lấy/phát triển từ data.
- Mỗi lớp source/ambiguity/scope/domain có ít nhất hai case.
- Ít nhất 10 case bắt buộc citation đúng document + page.
- Ít nhất 6 case có nguồn nhiễu, sai trang hoặc cùng trang ở tài liệu khác.
- Mọi citation cho phép có đủ `document_id`, `page`, `chunk_id`.
- Mọi `source_ref` truy được về `turn_id` trong chatlog.
- Mọi expected chunk và retrieved citation tồn tại trong `candidate_chunks`.
- PASS phải có chunk đúng trang; RECOVER phải dùng selected text khi retrieval thiếu.

### Review tay golden set

Mỗi người copy `golden-set-review.csv` thành một file mang tên mình, tự điền mà không xem file của người còn lại:

1. `source_matches`: source_ref có thực sự là nguồn của tình huống không.
2. `input_natural`: câu hỏi và selected text có giống hành vi học viên không.
3. `route_clear`: PASS/RECOVER/CLARIFY/ESCALATE có duy nhất và hợp lý không.
4. `citation_correct`: nguồn cho phép có đúng tài liệu, trang và chunk không.
5. `must_rules_clear`: người ngoài nhóm có áp dụng must/must-not giống nhau không.
6. `approved`: chỉ PASS khi năm cột trên đều PASS.

Nếu hai người lệch route, citation hoặc must/must-not, sửa case và ghi lý do trước khi đổi trạng thái case sang `approved`. Không xem output prototype trước khi khóa golden set.

## Việc cần review trước khi khóa v2

- Bảo: xác nhận lát cắt và quality bar khớp `spec.md`.
- Khánh Linh: xác nhận input/output contract khớp AI call thật.
- Thu: đọc 5–10 câu hỏi để kiểm tra ngôn ngữ tự nhiên.
- Sinh: sửa theo review, đổi `status` của từng case sang `approved` và cập nhật trạng thái meta.

Không đổi nội dung test chỉ để phù hợp output của model.

## Golden set khớp CP1 như thế nào

| Yêu cầu CP1 | Cách đo trong eval |
|---|---|
| Học viên bôi đen đoạn Trang X | `selected_text`, `document_id`, `target_page` |
| AI ưu tiên số trang | Đưa cả chunk đúng và chunk nhiễu vào `candidate_chunks`; chấm `page_priority` |
| Cite đúng trang | Citation cấu trúc; chấm `citation_exact_page` |
| Tự trả lời khi tìm được | Route PASS |
| Retrieval lỗi nhưng đoạn chọn đủ | Route RECOVER, citation `selected_text` |
| Không chắc thì báo rõ | Route CLARIFY/ESCALATE, chấm groundedness và safety |

Eval đo tính đúng của quyết định và citation. “Mất tin tưởng” là outcome người dùng, phải đo riêng trong `validation/`; không suy ra trực tiếp từ pass rate.

## Contract cần prototype hỗ trợ

Input:

```json
{
  "user_query": "...",
  "selected_text": "...",
  "page_or_context": "...",
  "document_id": "current-document",
  "target_page": 35,
  "candidate_chunks": [
    {
      "id": "page-35",
      "document_id": "current-document",
      "page": 35,
      "text": "..."
    },
    {
      "id": "other-doc-page-35",
      "document_id": "other-document",
      "page": 35,
      "text": "Nguồn nhiễu"
    }
  ]
}
```

Output:

```json
{
  "route": "PASS | RECOVER | CLARIFY | ESCALATE",
  "answer": "...",
  "citations": [
    {
      "kind": "retrieved_chunk | selected_text",
      "document_id": "current-document",
      "page": 35,
      "chunk_id": "page-35"
    }
  ],
  "used_chunk_ids": ["page-35"],
  "clarifying_question": "...",
  "reason": "..."
}
```

Nếu prototype trả schema khác, Khánh Linh và Sinh phải thống nhất adapter trước khi chạy; không sửa tay output giữa lượt.

Điểm quan trọng: `candidate_chunks` là danh sách ứng viên trước khi áp dụng ưu tiên trang. Nếu endpoint chỉ nhận sẵn một chunk đúng trang thì eval không kiểm được quyết định “dùng số trang làm context ưu tiên”.

## Quy tắc chấm

Một case pass khi tất cả đều pass:

1. `page_priority`: dùng chunk thuộc đúng `document_id + target_page` khi chunk này tồn tại.
2. `citation_exact_page`: PASS/RECOVER phải cite đúng document, page và chunk.
3. `distractor_rejection`: không dùng trang lân cận hoặc cùng số trang ở tài liệu khác.
4. `groundedness`: mọi claim bám nguồn được phép.
5. `route_correctness`: route khớp expected route.
6. `recovery_correctness`: không hỏi lại dữ liệu đã có; nếu hỏi thì đúng một câu cụ thể.
7. `safety_domain`: không đoán khi thiếu nguồn, không vượt thẩm quyền, không làm sai thuật ngữ.
8. `answer_size`: trực tiếp, không lặp dài, có bước tiếp theo khi không trả lời.

Trước lượt chính thức, hai người chấm độc lập cùng năm output. Nếu lệch quá một case hoặc lệch ở groundedness/safety, phải viết lại định nghĩa rồi hiệu chỉnh lại.

## Khi AI call sẵn sàng

Endpoint phải nhận contract input và trả contract output ở trên. Chạy:

```powershell
node eval/run-eval.mjs http://localhost:3000/api/tutor run-01-baseline gemini-3.1-flash-lite prompt-v1
```

Thay URL, model và prompt version bằng cấu hình thật của Khánh Linh. Runner gọi tuần tự đủ 20 case, ghi latency/lỗi và lưu `run-01-baseline.raw.json`.

Sau đó:

1. Chạy kiểm tra cấu trúc:

   ```powershell
   node eval/score-structural.mjs eval/run-01-baseline.raw.json
   ```

2. Tạo bảng review đã điền điểm cấu trúc:

   ```powershell
   node eval/prepare-review.mjs eval/run-01-baseline.raw.json
   ```

3. Hai reviewer hiệu chỉnh trên cùng năm output rồi điền các cột còn `TODO`: groundedness, recovery, safety/domain, answer size và case pass.
4. Mỗi case chỉ PASS khi tất cả chiều đều PASS; không bỏ lỗi gọi.
5. Tổng hợp:

   ```powershell
   node eval/summarize-review.mjs eval/run-01-baseline.review.csv
   ```

6. Báo tỷ lệ tổng, exact-page citation, distractor rejection, theo nhóm case/lớp khó và số vi phạm điều kiện cứng.
7. Chọn một failure lớn nhất, sửa đúng một nguyên nhân.
8. Chạy lại toàn bộ 20 case với `run_id` mới.

`summarize-review.mjs` không công nhận kết quả nếu thiếu case, trùng case hoặc còn `TODO`.

Không gọi output Tutor cũ là kết quả của prototype mới.
