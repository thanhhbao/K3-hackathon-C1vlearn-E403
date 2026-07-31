# Reflection cá nhân — Nguyễn Minh Thu

## Vai trò & phần mình làm
- **Vai trò:** Kỹ sư Trải nghiệm & Nghiệm thu (Product Owner/Validation).
- **Phần đảm nhận:** Phỏng vấn người dùng thực tế (Willing users) bằng phương pháp quan sát trực tiếp, thiết kế câu hỏi khảo sát trải nghiệm người dùng và lập tài liệu feedback log (`validation/feedback_log.md`).

## AI hỗ trợ thế nào
- AI hỗ trợ xây dựng kịch bản phỏng vấn ngắn gọn nhưng khai thác sâu vào "nỗi đau" (pain point) của học viên theo đúng chuẩn HAX/PAIR.
- Hỗ trợ phân loại và tổng hợp ý kiến người dùng để đề xuất các tính năng ưu tiên đưa vào Backlog cho nhóm phát triển.

## Một bài học từ case fail của nhóm
- **Case fail:** Kịch bản phỏng vấn bạn Hải khi cố tình hỏi mơ hồ không bôi đen text. Hệ thống ban đầu vẫn trả lời dựa trên phỏng đoán (gây rủi ro hallucination) thay vì từ chối thẳng.
- **Bài học:** Việc kiểm soát chất lượng câu trả lời phải được chặn ngay từ đầu vào. Nếu câu hỏi không đi kèm bôi đen (ngữ cảnh rỗng) hoặc từ khóa quá mơ hồ, hệ thống phải kiên quyết yêu cầu làm rõ (CLARIFY) ngay lập tức chứ không được cố gắng "đoán" ý người học, vì việc đoán sai kiến thức học thuật sẽ gây hậu quả rất nghiêm trọng.
