# Smoke test từ hai ảnh prototype

Đây là quan sát tạm thời từ ảnh người dùng cung cấp trong hội thoại. Ảnh chưa nằm trong repo và không có `used_chunk_ids`/trace, nên bảng này không thay thế lượt eval 20 case.

## SCREEN-001 — Trong lát cắt

- Input: Trang 12, selected text “Missing Values (Dữ liệu bị thiếu)”, câu hỏi “là cái gì”.
- Flow: Tutor tự trả lời và hiển thị “Trích dẫn: Trang 12”.
- Điểm tốt: route và citation hiển thị khớp lát cắt.
- Lỗi: câu trả lời thêm “dưới 5%” và “K-NN hoặc Decision Tree”, trong khi slide hiển thị chỉ nói xóa dòng, Mean/Median hoặc mô hình dự đoán.
- Kết luận: FAIL groundedness; không xác minh được page-priority khi chưa có trace.

## SCREEN-002 — Ngoài lát cắt

- Input không có selected text.
- Tutor báo chưa chắc chắn và yêu cầu bôi đen đoạn.
- Hành vi CLARIFY hợp lý nhưng không dùng để tính pass rate của lát cắt “học viên đã bôi đen đoạn Trang X”.

Muốn dùng hai ảnh làm artifact phúc khảo, lưu ảnh vào repo và thay `evidence_id` bằng đường dẫn file.
