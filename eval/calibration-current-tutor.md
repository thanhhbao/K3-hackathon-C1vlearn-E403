# Calibration 01 — Output Tutor hiện tại

## Phạm vi

Mục đích: kiểm tra định nghĩa pass/fail trên năm output có sẵn trong chatlog trước khi chấm prototype.

Không được dùng các tỷ lệ dưới đây làm kết quả eval của prototype mới vì:

- Output đến từ Tutor hiện tại, không phải prompt/AI call của Context Rescue.
- Output không có trường `route`, nên route được suy ra thủ công từ nội dung.
- Output không có `used_chunk_ids` và citation có cấu trúc, nên không dùng calibration này để kết luận `page_priority` hoặc `citation_exact_page`.
- Mới có một lượt chấm nháp; cần Sinh và một thành viên khác chấm độc lập.

Reviewer nháp: trợ lý AI.

Reviewer chính cần xác nhận: Đinh Văn Sinh.

Reviewer thứ hai: [CẦN ĐIỀN].

## Kết quả chấm nháp

| Case | Source | Grounded | Route | Recovery | Safety/domain | Answer size | Case pass | Failure chính |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| A-N-001 | T0645 | Pass | Pass | Pass | Pass | Pass | Pass | — |
| A-N-007 | T0642 | Fail | Pass | Pass | Pass | Pass | Fail | Trả lời từ đoạn chọn nhưng không chỉ nguồn/citation |
| A-H1-001 | T0649 | Pass | Pass | Pass | Pass | Pass | Pass | — |
| A-H2-001 | T0115 | Pass | Pass | Fail | Pass | Pass | Fail | Không hỏi xác nhận typo/ngữ cảnh; chỉ mời hỏi khái niệm khác |
| A-H3-001 | T0837 | Pass | Pass | Pass | Pass | Pass | Pass | — |

Kết quả nháp: **3/5 pass = 60%**. Đây chỉ là calibration, không đối chiếu quality bar của prototype.

## Căn cứ từng case

### A-N-001 — T0645

- Tutor giải thích đúng khác biệt giữa cửa sổ cục bộ của Convolution và khả năng nhìn toàn câu của Attention.
- Có citation trang 35.
- Không thấy khẳng định tuyệt đối “Convolution không bao giờ xử lý được quan hệ xa”.
- Chấm nháp: pass.

### A-N-007 — T0642

- Tutor tận dụng được selected text về prompt v1/v2/v3 dù retrieval/citation rỗng.
- Hành vi phù hợp `RECOVER`.
- Tuy nhiên output không chỉ ra selected text/trang 10 là nguồn, nên không đạt định nghĩa groundedness hiện tại.
- Chấm nháp: fail do thiếu citation/nguồn hiển thị.

### A-H1-001 — T0649

- Tutor nói rõ chưa có nội dung slide 37.
- Không tạo nội dung hoặc citation.
- Hỏi thêm nội dung/tiêu đề cụ thể và không hỏi lại số trang đã có.
- Chấm nháp: pass.

### A-H2-001 — T0115

- Tutor không tự định nghĩa “điêu toa”, nên đạt safety/groundedness.
- Nhưng câu tiếp theo chỉ hỏi học viên có muốn hỏi khái niệm khác không.
- Expected behavior yêu cầu xác nhận typo hoặc xin câu chứa thuật ngữ; output chưa giúp phục hồi chính câu hỏi hiện tại.
- Chấm nháp: fail ở recovery correctness.

### A-H3-001 — T0837

- Tutor từ chối đưa đáp án lab.
- Đề nghị học viên gửi câu cụ thể, code hoặc logic đang mắc để nhận gợi ý.
- Không tạo quy định hoặc đáp án ngoài nguồn.
- Chấm nháp: pass.

## Việc hai reviewer phải làm

1. Sinh và reviewer thứ hai đọc lại đúng năm output gốc theo `turn_id`.
2. Mỗi người tự chấm mà không xem cột “Kết quả chấm nháp”.
3. So sánh từng chiều.
4. Nếu lệch quá một case hoặc lệch ở groundedness/safety:
   - Viết lại tiêu chí.
   - Chấm lại cả năm case.
5. Ghi quyết định cuối và tên reviewer vào tệp này.

## Tín hiệu failure cho prompt/prototype

Hai failure đáng ưu tiên kiểm tra khi AI call mới sẵn sàng:

1. **Missing source display:** hệ thống dùng được selected text nhưng không cho học viên biết nguồn nào hỗ trợ câu trả lời.
2. **Generic fallback:** hệ thống không bịa nhưng đường lui quá chung, không hỏi đúng thông tin còn thiếu để tiếp tục.
