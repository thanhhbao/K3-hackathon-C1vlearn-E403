# VLearn AI Tutor - Validation Log (CP5)

**Thời gian thực hiện:** 31/07/2026
**Mục tiêu:** Đo đạc trải nghiệm người dùng với Prototype mới nhất (đã hỗ trợ Native Selection và 7 slides).
**Phương pháp:** Quan sát người dùng (Willing Users) tương tác trực tiếp với giao diện Web (Dry run) và ghi nhận phản hồi.

---

## 1. Người dùng: Đoàn Nhật Bình
* **Kịch bản test:** Happy Path - Đọc Slide 2, bôi đen cụm "Data Layer: Thu thập, lưu trữ..." và bấm Hỏi AI.
* **Câu hỏi:** "Bạn giải thích rõ hơn việc làm sạch dữ liệu ở layer này là làm những gì không?"
* **Kết quả hệ thống (Observed Route):** `PASS`. AI nhận diện đúng Trang 2, lấy chuẩn context và đưa ra các ví dụ về xóa dòng, điền khuyết (link với kiến thức bài 3).
* **Feedback:** 
  > *"Giao diện mở khung chat trượt ra rất mượt, nhìn pro thật. Câu trả lời chính xác, trích dẫn đúng trang 2. Rất hài lòng."*
* **Đánh giá:** Tốt (Pass).

## 2. Người dùng: Bùi Duy Hải
* **Kịch bản test:** Missing Context - Đọc Slide 4 nhưng không bôi đen gì cả, bấm thẳng vào ô chat hỏi.
* **Câu hỏi:** "Bạn giải thích kỹ hơn phần này được không?"
* **Kết quả hệ thống (Observed Route):** `CLARIFY`. Do câu hỏi quá mơ hồ ("phần này") và học viên không bôi đen (Missing Context), AI hỏi lại: "Bạn đang muốn tìm hiểu kỹ hơn về Zero-shot, Few-shot hay Chain-of-thought trên trang 4? Xin hãy bôi đen đoạn bạn chưa rõ để mình hỗ trợ nhé."
* **Feedback:** 
  > *"Ban đầu hơi bỡ ngỡ vì lười bôi đen cứ gõ bâng quơ, nhưng AI phản hồi rất thông minh khi biết mình đang ở trang 4 và nhắc khéo mình chọn đúng từ khóa. Xử lý như vầy giúp mình tập trung học hơn."*
* **Đánh giá:** Đạt yêu cầu Spec.

## 3. Người dùng: Lê Trung Hiếu
* **Kịch bản test:** Out of Scope - Bôi đen Slide 7 "Đóng gói mô hình bằng Docker".
* **Câu hỏi:** "Viết cho tôi một file Dockerfile hoàn chỉnh để deploy web app bằng Flask."
* **Kết quả hệ thống (Observed Route):** `ESCALATE`. AI phản hồi: "Xin lỗi, tôi chỉ tập trung hỗ trợ giải đáp các khái niệm trong phạm vi Khóa học AI Thực chiến. Vấn đề viết code chi tiết vượt quá chuyên môn của tôi."
* **Feedback:** 
  > *"Hệ thống chặn khá tốt, không bị dính lỗi sinh code (hallucination) lan man ra ngoài phạm vi bài học. Tuy nhiên nếu được, có thể chèn thêm link docs của Docker để học viên tự xem."*
* **Đánh giá:** Tốt (Pass an toàn).

## 4. Người dùng: Nguyễn Hoài Nam
* **Kịch bản test:** Ambiguous Query - Chuyển sang Slide 5, bôi đen chữ "Hallucination".
* **Câu hỏi:** "Cái này nguy hiểm như thế nào?"
* **Kết quả hệ thống (Observed Route):** `PASS`. AI hiểu "Cái này" chính là "Hallucination" thông qua cơ chế đính kèm ngữ cảnh (Context Pill).
* **Feedback:** 
  > *"Tính năng bôi đen tiện thật sự! Hồi xưa xài ChatGPT phải copy nguyên câu rồi gõ 'giải thích từ này...', giờ chỉ bôi đen rồi gõ 'cái này là sao', AI tự hiểu luôn. Rất tiết kiệm thời gian!"*
* **Đánh giá:** Tốt (Excellent).

## 5. Người dùng: Trần Anh Văn
* **Kịch bản test:** Long Selection - Bôi đen toàn bộ đoạn nội dung trên Slide 6.
* **Câu hỏi:** "Tóm tắt lại giúp mình ý chính."
* **Kết quả hệ thống (Observed Route):** `PASS`. AI tóm tắt gọn gàng 3 ý chính theo yêu cầu.
* **Feedback:** 
  > *"Tốc độ load nhanh, font chữ (Outfit) và màu tối rất êm mắt, đọc lâu không mỏi. Có một góp ý nhỏ là nên thêm nút 'Copy' ở dưới câu trả lời của AI để tiện lưu vào note cá nhân."*
* **Đánh giá:** Tốt. Ghi nhận tính năng Copy cho bản cập nhật sau.

---
**Kết luận Vòng Validation:** Prototype hoạt động ổn định 100% kịch bản. Tỉ lệ phản hồi lỗi (Hallucination/Lệch ngữ cảnh) là 0% nhờ áp dụng tốt cơ chế ép Context bằng Native Selection. Sẵn sàng nộp CP5.
