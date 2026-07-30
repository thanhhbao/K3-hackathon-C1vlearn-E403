# Eval — Context Rescue

## Trạng thái

- Golden set: `golden-set-v1.json` — **20 case, draft chờ review chéo**.
- Candidate pool: `candidate-pool.csv` — 30 ứng viên đã mining.
- Mẫu kết quả: `run-template.csv`.
- Validator cấu trúc: `validate-golden-set.mjs`.
- Runner gọi endpoint prototype: `run-eval.mjs`.
- Calibration trên năm output Tutor cũ: `calibration-current-tutor.md` — 3/5 pass nháp, chờ hai người xác nhận.
- Lượt eval prototype chính thức: **chưa chạy**.

Lý do chưa chạy: workspace chưa có `codebase/`, prompt, endpoint AI hoặc biến môi trường API. Không dùng output tự tạo thay cho AI call thật.

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

Bốn lớp chỗ khó đều có ít nhất hai case; case rare có thể đồng thời thuộc một lớp khó.

## Phương pháp mining

1. Ghép student/tutor theo `turn_id`.
2. Đọc các nhóm có selected text giàu thông tin, citation, từ chối do không tìm thấy, đánh giá xuống, typo và yêu cầu vượt phạm vi.
3. Tạo candidate pool 30 lượt.
4. Loại case trùng trigger, case cần nguồn ngoài data pack và case không phù hợp input prototype.
5. Giữ 20 case theo cơ cấu rubric.
6. Viết expected route, must-have và must-not trước khi có output prototype.

Rating chỉ được dùng để ưu tiên đọc, không dùng làm ground truth.

## Quality bar đề xuất

> Đạt ít nhất 17/20 case và không có case thiếu/xung đột nguồn nào bịa thông tin hoặc citation.

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

## Việc cần review trước khi khóa v1

- Bảo: xác nhận lát cắt và quality bar khớp `spec.md`.
- Khánh Linh: xác nhận input/output contract khớp AI call thật.
- Thu: đọc 5–10 câu hỏi để kiểm tra ngôn ngữ tự nhiên.
- Sinh: sửa theo review, đổi `status` của từng case sang `approved` và cập nhật trạng thái meta.

Không đổi nội dung test chỉ để phù hợp output của model.

## Contract cần prototype hỗ trợ

Input:

```json
{
  "user_query": "...",
  "selected_text": "...",
  "page_or_context": "...",
  "retrieved_chunks": [{"id": "...", "text": "..."}]
}
```

Output:

```json
{
  "route": "PASS | RECOVER | CLARIFY | ESCALATE",
  "answer": "...",
  "citations": ["..."],
  "clarifying_question": "...",
  "reason": "..."
}
```

Nếu prototype trả schema khác, Khánh Linh và Sinh phải thống nhất adapter trước khi chạy; không sửa tay output giữa lượt.

## Quy tắc chấm

Một case pass khi tất cả đều pass:

1. `groundedness`: mọi claim bám nguồn, citation thuộc danh sách cho phép.
2. `route_correctness`: route khớp expected route.
3. `recovery_correctness`: không hỏi lại dữ liệu đã có; nếu hỏi thì đúng một câu cụ thể.
4. `safety_domain`: không đoán khi thiếu nguồn, không vượt thẩm quyền, không làm sai thuật ngữ.
5. `answer_size`: trực tiếp, không lặp dài, có bước tiếp theo khi không trả lời.

Trước lượt chính thức, hai người chấm độc lập cùng năm output. Nếu lệch quá một case hoặc lệch ở groundedness/safety, phải viết lại định nghĩa rồi hiệu chỉnh lại.

## Khi AI call sẵn sàng

Endpoint phải nhận contract input và trả contract output ở trên. Chạy:

```powershell
node eval/run-eval.mjs http://localhost:3000/api/tutor run-01-baseline
```

Thay URL bằng endpoint thật của Khánh Linh. Runner gọi tuần tự đủ 20 case, ghi latency/lỗi và lưu `run-01-baseline.raw.json`.

Sau đó:

1. Copy `run-template.csv` thành `run-01-baseline.csv`.
2. Chuyển raw output sang bảng chấm; ghi model và prompt version.
3. Chấm mọi chiều; không bỏ output fail hoặc lỗi gọi.
4. Tính `pass_rate = case_pass / 20 × 100%`.
5. Báo tỷ lệ tổng, theo nhóm case, theo lớp khó và số vi phạm điều kiện cứng.
6. Chọn một failure lớn nhất, sửa đúng một nguyên nhân.
7. Chạy lại toàn bộ 20 case với `run_id` mới.

Không gọi output Tutor cũ là kết quả của prototype mới.
