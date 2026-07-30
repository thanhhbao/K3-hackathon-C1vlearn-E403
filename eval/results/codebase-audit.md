# Audit codebase và smoke test

Nguồn: `codebase/app.js`  
SHA-256: `03787626e78cc436a2560d11aef05c637a4a0b35e02488fff23bc983d901e815`

## Contract audit

| Điều kiện | Kết quả |
|---|---|
| Có lời gọi AI/API thật | Không |
| Câu trả lời hardcode | Có |
| Context/citation cố định Trang 12 | Có |
| Có contract document/page/candidate/used chunks | Không |

## Smoke result

| Case | Nhóm | Route | Citation | Page priority | Grounded | Pass |
|---|---|---|---|---|---|---|
| UI-S-001 | happy | PASS | PASS | FAIL | FAIL | FAIL |
| UI-S-002 | groundedness | PASS | PASS | FAIL | FAIL | FAIL |
| UI-S-003 | scope | FAIL | PASS | PASS | FAIL | FAIL |
| UI-S-004 | low_confidence | PASS | PASS | PASS | PASS | PASS |
| UI-S-005 | no_context | PASS | PASS | PASS | PASS | PASS |

Kết quả: **2/5 (40.0%)**.

Đây là smoke test của Mock tĩnh, không phải lượt golden set 20 case và không đáp ứng điều kiện “AI thật” của CP3/R5.
