# Báo cáo Cải thiện Hiệu năng Trợ lý AI (Aura)

Báo cáo này phân tích các nguyên nhân khiến phiên bản AI ban đầu hoạt động kém hiệu quả và cách các thay đổi trong mã nguồn hiện tại đã giải quyết những vấn đề đó.

## 1. So sánh Tổng quan

| Đặc điểm | Phiên bản Cũ (Kém thông minh) | Phiên bản Hiện tại (Thông minh/Linh hoạt) |
| :--- | :--- | :--- |
| **API Endpoint** | `/api/generate` (Chỉ xử lý đơn lẻ) | `/api/chat` (Hỗ trợ hội thoại nhiều bước) |
| **Trí nhớ (Context)** | Không có (Quên câu hỏi trước đó) | Có (Nhớ được lịch sử chat 6 câu gần nhất) |
| **Tham số sáng tạo** | `temperature: 0.2` (Máy móc, lặp lại) | `temperature: 0.8` (Tự nhiên, linh hoạt) |
| **Ngôn ngữ** | Dễ bị "lọt" tiếng Trung (Lỗi model gốc) | Ép buộc 100% tiếng Việt (Strict Rule) |
| **Định hướng dữ liệu** | Quy tắc cứng nhắc (Hardcoded rules) | Phân quyền vai trò (Role-playing instructions) |

---

## 2. Các nguyên nhân cốt lõi và Giải pháp

### A. Từ "Tĩnh" sang "Động" (Stateless vs Stateful)
- **Nguyên nhân cũ:** Sử dụng endpoint `/api/generate`. Mỗi khi người dùng hỏi, AI chỉ nhận được câu hỏi cuối cùng mà không biết những gì đã thảo luận trước đó. Điều này khiến AI trông có vẻ "ngơ ngác" khi người dùng nói "không", "tiếp đi" hoặc "tại sao?".
- **Giải pháp mới:** Chuyển sang `/api/chat` và gửi kèm mảng `history`. AI giờ đây có thể xâu chuỗi các câu hỏi để đưa ra câu trả lời logic xuyên suốt cuộc hội thoại.

### B. Tham số "Độ nhiệt" (Temperature)
- **Nguyên nhân cũ:** `temperature` quá thấp (0.2). Trong AI, mức này khiến model chỉ chọn những từ ngữ có xác suất cao nhất, dẫn đến câu trả lời cụt lủn, khô khan và giống hệt như một đoạn code được lập trình sẵn.
- **Giải pháp mới:** Tăng lên `0.8`. Đây là "điểm ngọt" giúp model Qwen 2.5 phát huy khả năng suy luận, hành văn trôi chảy và có cảm xúc như người thật hơn.

### C. Cách thức điều hướng (Prompt Engineering)
- **Nguyên nhân cũ:** Sử dụng các câu lệnh phủ định ("KHÔNG được làm cái này", "CHỈ được làm cái kia"). Điều này vô tình tạo ra một "chiếc lồng" khiến AI bị bí bách, khi gặp các trường hợp nằm ngoài quy tắc, nó sẽ trả lời rất ngô nghê.
- **Giải pháp mới:** Thiết lập vai trò (Aura - Trợ lý đa năng). Thay vì cấm đoán, chúng ta cung cấp **Ngữ cảnh (Data Context)** và **Hướng dẫn hành vi**. AI được khuyến khích sử dụng trí thông minh tự thân để quyết định khi nào cần lấy số liệu, khi nào cần trò chuyện xã giao.

### D. Liên kết dữ liệu hệ thống
- **Nguyên nhân cũ:** AI không hiểu rằng dữ liệu truyền vào chính là "Hệ thống của người dùng". Khi hỏi "Hệ thống của tôi có gì?", AI sẽ tìm kiếm trong kiến thức của nó thay vì nhìn vào Database.
- **Giải pháp mới:** Định danh rõ ràng trong System Prompt: *"Dữ liệu sau đây chính là Hệ thống của người dùng"*. Điều này tạo ra sợi dây liên kết trực tiếp giữa câu hỏi của bạn và cơ sở dữ liệu thực tế.

---

## 3. Kết luận
Sự thông minh của AI không chỉ nằm ở bản thân Model (Qwen 2.5), mà phần lớn nằm ở **cách chúng ta "giao tiếp" với nó qua mã nguồn**. Việc chuyển đổi sang cơ chế Chat Multi-turn và tối ưu hóa Prompt đã giúp Aura từ một chatbot phân loại đơn thuần trở thành một cộng sự phân tích dữ liệu thực tế.
