# Reflection cá nhân — Lâm Thành Bảo

## Vai trò & phần mình làm
- **Vai trò:** Trưởng nhóm (Team Leader).
- **Phần đảm nhận:** Điều phối tiến độ chung của nhóm, thiết kế tài liệu `spec.md`, xây dựng khung nội dung slide thuyết trình (`demo-slides.html`), quản lý và đồng bộ mã nguồn trên kho lưu trữ Git.

## AI hỗ trợ thế nào
- AI hỗ trợ lập dàn ý và xây dựng cấu trúc tài liệu spec theo đúng chuẩn PAIR/HAX của cuộc thi một cách nhanh chóng.
- Hỗ trợ viết code HTML/CSS cho khung slide trình chiếu đẹp mắt và chuẩn hóa các liên kết tài liệu markdown, giúp tiết kiệm 70% thời gian làm tài liệu giấy tờ để tập trung điều phối kỹ thuật.

## Một bài học từ case fail của nhóm
- **Case fail:** Lượt chạy `run-02-fixed` gặp lỗi ở các case thuộc nhánh `RECOVER` (khi AI cần dùng selected_text làm nguồn nhưng không trả về chính xác cấu trúc citation).
- **Bài học:** Không thể phó mặc hoàn toàn cho sự thông minh mặc định của AI. Khi hệ thống yêu cầu một cấu trúc dữ liệu đầu ra nghiêm ngặt (như JSON schema chứa citation), prompt phải chỉ định rõ ràng từng trường hợp rẽ nhánh dữ liệu kèm ví dụ (few-shot), nếu không AI sẽ tự chế cấu trúc dẫn đến lỗi parse ở hệ thống chấm điểm tự động.
