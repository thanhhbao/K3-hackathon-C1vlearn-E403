# Kết quả kiểm golden set v2

Ngày kiểm: 30/07/2026.

Lệnh:

```powershell
node eval/validate-golden-set.mjs
```

## Kết quả máy kiểm

| Hạng mục | Kết quả |
|---|---:|
| Tổng case | 20 |
| Case thường / khó / hiếm | 8 / 8 / 4 |
| Case real / adapted | 15 / 5 |
| Source ref truy được về chatlog | 20/20 |
| PASS / RECOVER / CLARIFY / ESCALATE | 5 / 5 / 5 / 5 |
| Case bắt buộc cite đúng trang | 10 |
| Case có nguồn nhiễu thực sự | 7 |
| Lớp source / ambiguity / scope / domain | 3 / 3 / 4 / 2 |
| Schema, expected chunk và citation | VALID |

## Kết luận

Golden set đạt cấu trúc của rubric và đo đúng cơ chế page-priority của lát cắt CP1. Golden set vẫn là `draft_pending_peer_review`; kiểm máy không thay review nội dung.

Trước khi khóa:

1. Hai người chấm độc lập bằng hai bản copy của `golden-set-review.csv`.
2. Đối chiếu từng `source_ref` với student/tutor message gốc.
3. Chỉ approve case khi source, input, route, citation và must/must-not đều rõ.
4. Ghi quality bar vào `spec.md` trước hạn và lưu commit SHA.
5. Không sửa case theo output model sau khi đã khóa.

Số `237/1.261` không được validator xác nhận; xem `evidence-audit.md`.
