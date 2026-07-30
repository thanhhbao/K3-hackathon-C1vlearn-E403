# Kết quả eval

## Trạng thái hiện tại

`run-00-blocked.csv` ghi đủ 20 case ở trạng thái `NOT_RUN`. Đây là trace trung thực của lần chuẩn bị eval ngày 30/07/2026, không phải kết quả model và không được dùng để tính pass rate.

`screenshot-smoke.csv` chấm hai trạng thái trong ảnh prototype. Chỉ SCREEN-001 nằm trong lát cắt CP1 và đang FAIL groundedness; đây không phải lượt chạy golden set.

Nguyên nhân:

- Repo chưa có thư mục `codebase/`.
- Không có endpoint nhận contract trong `eval/README.md`.
- Không có API key hoặc model cục bộ.
- Tab prototype trong ảnh không được kết nối với phiên kiểm thử.

## Điều kiện để có lượt chính thức

1. Đưa code prototype và prompt vào repo.
2. Cung cấp endpoint nhận đủ `document_id`, `target_page`, `selected_text` và `candidate_chunks`.
3. Endpoint trả `route`, `answer`, `citations` có cấu trúc và `used_chunk_ids`.
4. Lưu model, prompt version và trace thật.
5. Chạy đủ 20 case, kể cả lỗi gọi.

Không thay `NOT_RUN` bằng PASS/FAIL dựa trên ảnh giao diện hoặc expected answer trong golden set.
