# Kết quả eval

## Trạng thái hiện tại

`run-00-blocked.csv` ghi đủ 20 case ở trạng thái `NOT_RUN`. Đây là trace trung thực của lần chuẩn bị eval ngày 30/07/2026, không phải kết quả model và không được dùng để tính pass rate.

`screenshot-smoke.csv` chấm hai trạng thái trong ảnh prototype. Chỉ SCREEN-001 nằm trong lát cắt CP1 và đang FAIL groundedness; đây không phải lượt chạy golden set.

`codebase-smoke-v1.csv` được sinh trực tiếp từ ba nhánh hardcode trong `codebase/app.js`: 2/5 pass. `codebase-audit.md` lưu SHA-256 và khoảng cách giữa Mock với contract CP1.

Nguyên nhân:

- `codebase/` là Mock tĩnh, không có endpoint nhận contract trong `eval/README.md`.
- Không có lời gọi AI, API key hoặc model cục bộ.
- Trang/context/câu trả lời đang hardcode, không nhận 20 input golden set.

## Điều kiện để có lượt chính thức

1. Tách logic Tutor thành endpoint hoặc pure function và lưu prompt trong repo.
2. Cung cấp endpoint nhận đủ `document_id`, `target_page`, `selected_text` và `candidate_chunks`.
3. Endpoint trả `route`, `answer`, `citations` có cấu trúc và `used_chunk_ids`.
4. Lưu model, prompt version và trace thật.
5. Chạy đủ 20 case, kể cả lỗi gọi.

Không thay `NOT_RUN` bằng PASS/FAIL dựa trên ảnh giao diện hoặc expected answer trong golden set.
