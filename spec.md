# AI SPEC — Context Rescue: Page-Priority Tutor · Nhóm C1vlearn
Hướng: [x] A — VLearn
Loại: [x] Tối ưu tính năng có sẵn

## §1. User & Job

- **Job executor:** Học viên đang đọc slide trong buổi học trên VLearn
- **Core JTBD:** Hiểu được nội dung đoạn slide đang đọc ngay trong lúc học, không cần tra ngoài
- **Problem statement:** Học viên bôi đen đoạn văn ở Trang X và hỏi AI tutor — tutor trả về "không tìm thấy nội dung trang X" dù học viên đang đứng ngay trang đó — bị block hoàn toàn, mất tin tưởng vào AI
- **Evidence — Đường B (mining chatlog):**
  - Số liệu: 237/1261 lượt hỏi (18.8%) tutor trả về "không tìm thấy"; 37/70 lượt có rating là down (52.9%); 46.2% response không có citation
  - Phương pháp đếm: lọc tutor message chứa từ khoá "không tìm thấy / xin lỗi / không có thông tin / cung cấp thêm" trên toàn bộ 1261 tutor message trong file `data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv`; kiểm lại bằng tay 20 mẫu ngẫu nhiên
  - Ví dụ nguyên văn từ chatlog:
    1. `[T0649]` Student: "(Trang 37) tóm tắt nội dung chính trong slide này" → Tutor: "Xin lỗi bạn, tôi không tìm thấy nội dung cụ thể cho slide 37"
    2. `[T0769]` Student: "(Trang 4) giải thích nghĩa chi tiết của trang 4" → Tutor: "rất xin lỗi vì hiện tại hệ thống tìm kiếm không tìm thấy nội dung cụ thể cho trang 4"
    3. `[T1258]` Student: "(Trang 33) tóm tắt slide này" → Tutor: "Rất tiếc là tôi đã tra cứu trong tài liệu nhưng chưa tìm thấy nội dung cụ thể của Trang 33"
    4. `[T0408]` Student: "(Trang 14) tóm tắt các chủ đề chính" → Tutor: "Rất tiếc, tôi không thể tìm thấy tệp tin hoặc nội dung chi tiết"
    5. `[T0905]` Student: "(Trang 50) tóm gọn những nội dung quan trọng nhất" → Tutor: "hiện tại tôi không tìm thấy tài liệu tổng hợp đầy đủ cho toàn bộ nội dung"

## §2. Impact & quyết định chọn

- **Bảng impact ≥3 ứng viên:**

| Ứng viên | Số người gặp | Tần suất | Tốn gì mỗi lần | Build nổi không |
|---|---|---|---|---|
| **Fix tutor fail tìm slide** | 18.8% lượt hỏi (~1/5 lần) | Mỗi buổi học | Bị block, mất tin tưởng, bỏ dùng tutor | ✅ Cao |
| Fix citation thiếu/sai trang | 46.2% response | Mỗi câu trả lời | Không kiểm chứng được AI nói gì | ✅ Cao |
| Tutor kiểm tra hiểu bài | 99.76% lượt thiếu | Mỗi buổi | Học xong không biết hiểu đúng chưa | ⚠️ Trung bình |

- **Ứng viên đã loại:**
  - Citation thiếu/sai — cùng gốc rễ với vấn đề 1; fix retrieval thì citation tự cải thiện theo
  - Tutor kiểm tra hiểu bài — cần thiết kế flow mới phức tạp hơn, rủi ro cao hơn trong thời gian sự kiện

- **Ứng viên chọn:** Fix tutor fail tìm slide — số đo rõ nhất (18.8%), bằng chứng mạnh (rating down xác nhận), build khả thi trong 1 ngày

## §3. Giải pháp tương tự đã nghiên cứu

- **VLearn Tutor hiện tại:** dùng semantic search, không ưu tiên số trang → fail khi trang không index đúng. Đáng né: trả về "không tìm thấy" mà không hướng dẫn gì
- **Khanmigo (Khan Academy):** cite nguồn bài học cụ thể trong mọi câu trả lời. Đáng học: luôn grounding vào tài liệu trước khi trả lời. Khác ở lát cắt này: dùng số trang làm ưu tiên retrieval thay vì chỉ semantic
- **NotebookLM:** luôn cite nguồn cạnh câu trả lời, báo rõ khi không có trong tài liệu. Đáng học: phân biệt rõ "có trong tài liệu" vs "không có". Đáng né: không có flow hướng dẫn user bôi đen lại
- **ChatGPT:** không có tài liệu context → đoán bừa. Đáng né: không nên trả lời khi không có căn cứ

## §4. Thiết kế

- **Lát cắt MỘT CÂU:** Học viên bôi đen đoạn ở Trang X và hỏi → AI dùng số trang làm context ưu tiên để tìm đúng chunk → trả lời kèm cite đúng trang, hoặc báo rõ khi không tìm được.

- **Non-goals (không build):**
  1. Không build tính năng note-taking hay chia sẻ note
  2. Không cải thiện chất lượng giải thích nội dung ngoài grounding
  3. Không thay đổi UI/UX của VLearn gốc
  4. Không xử lý câu hỏi không liên quan đến tài liệu hiện tại

- **Mức prototype:** [x] Mock — AI thật ở lõi retrieval + routing, UI mô phỏng flow VLearn, data từ golden set

- **Automation:** [x] Conditional
  - Lý do theo cost-of-error: Sai kiến thức học thuật → học viên học sai → đắt. AI tự trả lời khi tìm được chunk với độ tin cậy cao (route PASS/RECOVER); hỏi lại hoặc từ chối khi không chắc (route CLARIFY/ESCALATE) — không đoán bừa

- **§4b. Nguyên tắc HAX/PAIR:**

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| G2 — Làm rõ làm tốt đến đâu | Hiển thị "Trích dẫn: Trang X" khi tìm được (route PASS/RECOVER); hiển thị thông báo rõ khi không tìm được (route CLARIFY) |
| G10 — Thu hẹp phạm vi khi nghi ngờ | Khi học viên hỏi không bôi đen → hướng dẫn bôi đen; khi chunk không đủ tin cậy → hỏi đúng 1 câu, không đoán |
| G8 — Gạt bỏ dễ dàng | Học viên bỏ qua câu trả lời và hỏi câu khác được ngay, không bị block flow |
| G11 — Giải thích vì sao | Câu trả lời luôn kèm "Dựa trên đoạn bạn chọn ở Trang X..." để học viên biết AI lấy từ đâu |
| G1 — Làm rõ hệ thống làm được gì | Khi route ESCALATE: nêu rõ phạm vi hỗ trợ là nội dung bài học, không cung cấp đáp án hay thông tin hệ thống |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)

| Tình huống | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|
| Học viên hỏi trang không có trong transcript (Trang 37, 33) | ① Nguồn sự thật | Báo rõ "không tìm thấy trang X trong tài liệu", hỏi 1 câu để lấy tiêu đề/nội dung | G2, G10 |
| Chunk retrieval trả về trang sai (page-60 khi hỏi trang 33) | ① Nguồn sự thật | Phát hiện chunk sai trang, không dùng làm citation | G10, G11 |
| Học viên gõ câu hỏi không bôi đen | ② Mơ hồ | Hướng dẫn bôi đen đoạn cần hỏi, không đoán | G10 |
| Selected text quá ngắn/vô nghĩa ("điêu toa", "Othello-GP") | ② Mơ hồ | Hỏi xác nhận 1 câu, không tự định nghĩa | G10 |
| Selected text chứa nhiễu nhiều trang | ② Mơ hồ | Thu hẹp hỏi phần nào cần giải thích | G10 |
| Học viên xin đáp án bài lab | ③ Ngoài phạm vi | Từ chối lịch sự, mời hỏi câu cụ thể để nhận gợi ý | G1, G8 |
| Prompt injection — xin password/API key/bỏ qua quy tắc | ③ Ngoài phạm vi | Từ chối ngắn gọn, không tiết lộ, không bị chi phối | G1, G10 |
| Học viên hiểu lầm domain — "Agent bắt buộc in chain-of-thought" | ④ Đặc thù domain | Sửa hiểu lầm nhưng giới hạn kết luận theo đúng nguồn | G11 |
| Hai chunk cùng trang nhưng mâu thuẫn nhau | ④ Đặc thù domain | Không tự chọn nguồn, báo rõ xung đột và chuyển TA | G10, G11 |

## §6. Bốn đường đi của trải nghiệm

- **Happy path:** Học viên bôi đen đoạn Trang X → hỏi → AI tìm được chunk đúng trang → trả lời kèm "Trích dẫn: Trang X" (route PASS)
- **Low-confidence (②):** Học viên hỏi không bôi đen → AI hiển thị "Bôi đen đoạn cần hỏi rồi bấm Hỏi AI" → học viên bôi đen → hỏi lại (route CLARIFY)
- **Failure/không căn cứ (①):** Học viên bôi đen Trang X nhưng không có chunk đúng trang → AI dùng selected_text làm nguồn nếu đủ thông tin (route RECOVER), hoặc báo rõ không tìm được và hỏi 1 câu (route CLARIFY)
- **Correction (user sửa):** Học viên thấy câu trả lời chưa đúng → bôi đen đoạn khác → hỏi lại → AI xử lý câu hỏi mới độc lập
- **Khi bị đòi ngoài phạm vi (③):** Học viên xin đáp án/secret → AI từ chối lịch sự, nêu phạm vi hỗ trợ (route ESCALATE)
- **Case đặc thù domain (④):** Thuật ngữ sai/hiểu lầm → sửa đúng theo nguồn, không thêm thông tin ngoài

## §7. Kiểm thử

- **Chiều chất lượng + định nghĩa kiểm chứng được:**
  - Chiều 1 — Page priority (pass/fail): AI dùng chunk thuộc đúng `document_id=current-document` và đúng `target_page` khi chunk đó tồn tại. Người ngoài nhóm kiểm tra bằng cách đọc `used_chunk_ids` và đối chiếu `target_page`
  - Chiều 2 — Citation đúng trang (pass/fail): PASS/RECOVER phải cite đúng document, page và chunk_id. Kiểm tra bằng cách đọc field `citations` trong output
  - Chiều 3 — Không bịa (pass/fail): CLARIFY/ESCALATE không được tạo citation hoặc khẳng định thông tin không có trong nguồn

- **Golden set:** 20 case, file tại `eval/golden-set-v2.json`
  - 8 case thường (A-N-001 đến A-N-008)
  - 8 case khó (A-H1 đến A-H4, 2 case mỗi lớp)
  - 4 case hiếm (A-R-001 đến A-R-004)
  - 15 case từ chatlog thật, 5 case phát triển từ chatlog

- **Quality bar (chốt 23:59 N1, giữ nguyên sau đó):** "Đạt khi ≥75% case qua bộ (≥15/20), và 0 case nào cite sai trang khi đã tìm được nội dung"

- **Kết quả các lượt chạy:**

| Lượt | Run ID | Model | Structural pass | Ghi chú |
|---|---|---|---|---|
| 1 | run-01-baseline | gemini-3.1-flash-lite | 13/20 (65%) | 13 lỗi gọi do timeout/503 |
| 2 | run-02-fixed | gemini-3.1-flash-lite | 13/20 (65%) | 0 lỗi gọi; 7 fail do RECOVER không cite selected_text |

## §8. Phân công & kế hoạch

- **Phân công:**
  - Lâm Thành Bảo: spec.md + Canvas + repo
  - Phan Bá Khánh Linh: build UI prototype + AI call
  - Đinh Văn Sinh: golden set + eval + scoring
  - Nguyễn Minh Thu: willing users + validation CP5

- **Willing users (≥3):** Lê Trung Hiếu, Đoàn Nhật Bình, Bùi Duy Hải

- **Kế hoạch validation CP5 (09:00 N2):**
  - Thu mời ≥3 willing users + 2 bạn trong lớp thử prototype
  - Mỗi người: giao task thật → im lặng quan sát → hỏi 3 câu: "Điều gì khó hiểu nhất?" · "Kết quả này bạn có tin không?" · "Bạn có dùng thật không?"
  - Log nguyên văn vào `validation/feedback-log.md`

- **Multi-prototype:** Không thực hiện do giới hạn thời gian

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| 2026-07-30 CP3 | Đổi model từ gemini-3.5-flash sang gemini-3.1-flash-lite | gemini-3.5-flash timeout và 503 liên tục khi chạy 20 case |
| 2026-07-30 CP3 | Thêm retry logic (3 lần, delay 5-10s) vào server.py | Giảm lỗi 503 UNAVAILABLE khi model quá tải |
| 2026-07-30 CP3 | Fix citation validation — bỏ citation thiếu field | run-eval.mjs báo lỗi "citation phải có document_id, page, chunk_id" |
