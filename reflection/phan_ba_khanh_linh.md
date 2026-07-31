# Reflection cá nhân — Phan Bá Khánh Linh

## Vai trò & phần mình làm
- **Vai trò:** Lập trình viên chính (Developer).
- **Phần đảm nhận:** Xây dựng toàn bộ giao diện Frontend (`index.html`, `style.css`), viết logic điều khiển Client (`app.js`) để bắt sự kiện bôi đen (Native Selection) và kết nối API với server Backend (`server.py`).

## AI hỗ trợ thế nào
- AI hỗ trợ rất mạnh trong việc tái cấu trúc giao diện CSS sang phong cách Dark Theme/Glassmorphism cực kỳ chuyên nghiệp và mượt mà.
- Hỗ trợ debug nhanh lỗi vỡ layout Flexbox khi sidebar chat trượt ra và tối ưu hàm JS bắt tọa độ bôi đen chuột để hiển thị Action Tooltip chính xác trên màn hình.

## Một bài học từ case fail của nhóm
- **Case fail:** Lỗi vỡ giao diện khung chat bị trôi xuống đáy màn hình và không cuộn được sau khi chạy tự động format code.
- **Bài học:** Dù AI có thể viết CSS và JS riêng lẻ rất tốt, nhưng nếu cấu trúc phân cấp thẻ (DOM hierarchy) trong file HTML bị đóng/mở sai hoặc thừa thẻ `</div>` do công cụ định dạng tự động, toàn bộ layout Flexbox sẽ bị phá hủy. Lập trình viên luôn phải kiểm soát cấu trúc HTML thủ công một cách cẩn thận chứ không được tin cậy hoàn toàn vào các tool format tự động.
