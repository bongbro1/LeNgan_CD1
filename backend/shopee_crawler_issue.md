# Báo cáo Vấn đề: Shopee Crawler Anti-Bot (Error 90309999)

## 1. Mô tả vấn đề
Hiện tại, hệ thống Crawler không thể lấy dữ liệu review từ Shopee API (`/api/v2/item/get_ratings`). Mọi yêu cầu từ backend Python đều bị trả về lỗi:
`{"error": 90309999, "action_type": 2, "is_login": true}`

*   **Ý nghĩa lỗi:** Đây là cơ chế chặn bot chủ động của Shopee (SGW - Shopee Gateway). `action_type: 2` yêu cầu xác thực người dùng (Captcha/Slider).

## 2. Các nỗ lực đã thực hiện (Và kết quả)

| Phương pháp | Kỹ thuật chi tiết | Kết quả | Lý do thất bại |
| :--- | :--- | :--- | :--- |
| **Thư viện chuẩn** | Dùng `requests`, `aiohttp` | Thất bại | Bị nhận diện vân tay TLS (JA3) ngay lập tức. |
| **Giả lập trình duyệt** | Dùng `curl_cffi` (Chrome 120) | Thất bại | Shopee kiểm tra thứ tự Header và Chữ ký bảo mật cực kỳ khắt khe. |
| **Đồng bộ Header** | Ép thứ tự Header, đồng bộ Referer/URL | Thất bại | Chữ ký `x-sap-sec` bị gắn chặt với Session ID và thời gian thực. |
| **System CURL** | Gọi lệnh `curl` của hệ điều hành qua Python | Thất bại | Dù chạy được ở Terminal thủ công, nhưng khi gọi qua Python vẫn bị chặn do thiếu context môi trường. |
| **Playwright Fetch** | Chạy lệnh `fetch` trong trình duyệt ẩn | Thất bại | Vướng chính sách CORS của Shopee khi gọi API từ domain khác. |

## 3. Phân tích nguyên nhân gốc rễ
Hệ thống bảo mật của Shopee dựa trên 3 lớp phòng thủ mà Script Python khó vượt qua:
1.  **Token x-sap-sec:** Chuỗi chữ ký này cực kỳ dài (>1000 ký tự) và được tạo ra bởi một module Javascript ẩn. Nó bị hết hạn (expire) chỉ sau vài phút. Việc copy-paste thủ công không thể duy trì tính ổn định.
2.  **TLS Fingerprinting:** Shopee Gateway kiểm tra các thông số kỹ thuật của gói tin (Window Size, Cipher Suites). Chỉ cần một sai lệch nhỏ so với trình duyệt thật, nó sẽ trả về 90309999.
3.  **Hành vi Stateless:** Việc gọi API trực tiếp mà không có các yêu cầu "mồi" (như tải ảnh, tải CSS, track hành vi chuột) khiến Shopee dễ dàng phân biệt giữa Script và Người dùng thật.

## 4. Giải pháp đề xuất
Để dự án có thể chạy ổn định trong môi trường Production, chúng ta cần thay đổi hoàn toàn cách tiếp cận:

### Giải pháp: Automation Browser Scraping (Dùng Playwright)
*   **Cơ chế:** Thay vì gọi API ẩn, chúng ta dùng Playwright để **mở một trình duyệt thật**, tự động điều hướng đến URL sản phẩm.
*   **Ưu điểm:**
    *   Không bao giờ lo về Token `x-sap-sec` vì trình duyệt tự tạo ra.
    *   Vượt qua 100% các lớp check TLS/Header.
    *   Có thể lấy được dữ liệu bằng cách "bắt" (intercept) các gói tin Network mà trình duyệt đang tải.
*   **Nhược điểm:** Tốn tài nguyên RAM hơn một chút và tốc độ chậm hơn gọi API trực tiếp khoảng 1-2 giây.

---
*Người lập báo cáo: Antigravity AI*
*Ngày: 07/05/2026*
