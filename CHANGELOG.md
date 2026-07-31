# Changelog

Tài liệu này ghi nhận những thay đổi của hệ thống (Đặc biệt là UI/UX và Logic xử lý) dựa trên kết quả phát triển từ CP3 tới CP5 và quá trình thu thập Feedback.

## [v1.1.0] - 31/07/2026 (Bản nộp CP5)

### ✨ Tính năng mới (Added)
- **Native Text Selection:** Loại bỏ cơ chế fake selection cứng nhắc. Người dùng hiện có thể dùng chuột bôi đen trực tiếp bất kỳ đoạn văn bản nào trên giao diện Slide để gọi popup "Hỏi AI".
- **Dynamic Slide System:** Thêm cơ chế chuyển đổi 7 trang slide bài giảng đa dạng (từ bài 1 đến bài 7) thay vì 1 trang cố định. Header chat tự động trích xuất đúng trang hiện tại.
- **Glassmorphism UI:** Áp dụng giao diện Premium Dark Theme mới với Font `Outfit`, hiệu ứng mờ (backdrop-filter) và shadow chiều sâu.

### 🐛 Sửa lỗi (Fixed)
- **Lỗi vỡ Layout:** Khắc phục tình trạng khung Chat bị đẩy rớt xuống dưới màn hình khi ấn nút "Hỏi AI" bằng cách chuẩn hóa cấu trúc DOM và Flexbox CSS, đảm bảo tính năng trượt (Slide-in) êm ái.
- **Hiển thị Badge số trang:** Sửa lỗi logic trong `app.js` khiến badge `Trong slide: X` ở thanh Sidebar không cập nhật đúng số trang khi người dùng chuyển trang slide.

### 🔄 Cải thiện (Changed)
- **Prompt System:** (Phía Backend) Giữ nguyên cơ chế phân loại Router (PASS, CLARIFY, ESCALATE), nhưng tối ưu để nhận diện tốt hơn biến số ngữ cảnh được đẩy lên từ Frontend thông qua `selected_text` và `target_page`.

---
*Các tính năng chờ phát triển (Ghi nhận từ Feedback CP5):*
- *[Planned]* Cân nhắc bổ sung nút "Copy" vào bong bóng chat của AI để học viên dễ lưu trữ (Đề xuất của Văn).
- *[Planned]* Bổ sung nút link tài liệu mở rộng khi rơi vào nhánh `ESCALATE` (Đề xuất của Hiếu).
