# Reflection cá nhân — Đinh Văn Sinh

## Vai trò & phần mình làm
- **Vai trò:** Kỹ sư Đảm bảo chất lượng (QA/QC).
- **Phần đảm nhận:** Thiết kế tập dữ liệu kiểm thử (Golden set v2 - 20 cases) phản ánh đúng các tình huống thực tế của học viên, chạy các script đánh giá (`run-eval.mjs`, `score-structural.mjs`) và phân tích điểm số qua các lượt chạy.

## AI hỗ trợ thế nào
- AI hỗ trợ sinh nhanh (generate) dữ liệu mock JSON cho 20 test cases đa dạng từ kịch bản dễ đến khó.
- Hỗ trợ viết nhanh các script JavaScript bổ trợ để đọc file log và tính toán tỷ lệ đỗ (pass rate) một cách chính xác mà không cần viết thủ công từ đầu.

## Một bài học từ case fail của nhóm
- **Case fail:** Lượt chạy đầu tiên (`run-01-baseline`) bị fail hàng loạt case do lỗi timeout và API trả về mã lỗi 503 từ server Gemini.
- **Bài học:** Khi thực hiện đánh giá tự động (evaluation) với số lượng câu hỏi gọi API lớn và song song, hệ thống rất dễ bị kích hoạt giới hạn băng thông (rate limit). Cần phải thêm cơ chế bắt lỗi và thử lại (retry logic với exponential backoff) ở phía backend để đảm bảo hệ thống đánh giá chạy ổn định và bền bỉ.
