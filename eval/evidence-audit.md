# Audit evidence — Pain “Tutor không tìm được trang đã chọn”

## Kết luận

Chưa có artifact nào trong repo tái lập được số **237/1.261 = 18,8%**. Không nên đưa số này vào Canvas, spec hoặc slide nếu nhóm chưa cung cấp:

- Quy tắc gắn nhãn “Tutor fail”.
- Danh sách 237 `turn_id`.
- Kết quả review tay và cách xử lý false positive.

## Số tái lập được từ data pack

Phạm vi: 1.261 dòng `role=tutor`.

Quy tắc tự động sơ bộ đã dùng:

```text
không tìm thấy
OR không có ... thông tin
OR chưa có ... thông tin
OR không thể ... xác định
```

Kết quả:

- 155/1.261 lượt khớp, tương đương **12,3%**.
- 154/155 lượt có cụm “đoạn được chọn” trong câu hỏi học viên.
- Trong 155 lượt: 9 rating xuống, 0 rating lên, 146 không có rating.

Rating toàn bộ data:

- Chỉ 70/1.261 lượt Tutor có rating, độ phủ **5,6%**.
- 37/70 là rating xuống, tương đương **52,9%** số lượt có rating.
- 33/70 là rating lên.

Vì vậy, câu “37/70 rating là down” đúng về số học nhưng không chứng minh 37 lượt fail. Chỉ 9 lượt trong nhóm 155 nói trên có rating xuống.

## Câu evidence nên dùng ở CP1

> Phép đếm tự động sơ bộ trên 1.261 lượt Tutor tìm thấy 155 lượt (12,3%) có mẫu trả lời thiếu/không tìm thấy thông tin; 154/155 câu hỏi vẫn chứa đoạn được chọn. Trong toàn bộ data chỉ 70 lượt có rating, gồm 37 down và 33 up; riêng nhóm 155 có 9 down, 0 up và 146 không rating. Nhóm sẽ review tay toàn bộ nhãn trước khi chốt số trong spec.

## Nếu nhóm muốn giữ số 237

Tạo thêm `evidence/page-fail-labels.csv` với tối thiểu:

```text
turn_id,label,reason,reviewer_1,reviewer_2,agreement
```

Chỉ giữ số 237 khi:

1. Mọi dòng có một trigger cụ thể.
2. Hai người review độc lập.
3. False positive đã bị loại.
4. Phương pháp đếm được ghi trong spec.
