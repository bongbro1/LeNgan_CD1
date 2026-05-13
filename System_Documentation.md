# Tài liệu Hệ thống Phân tích Đánh giá Sản phẩm Shopee (Aura AI)

Hệ thống là một ứng dụng toàn diện tích hợp giữa việc thu thập dữ liệu (Web Crawling), phân tích ngôn ngữ tự nhiên (NLP) và trí tuệ nhân tạo (AI Chat) để giúp người dùng hiểu rõ chất lượng sản phẩm thông qua các đánh giá thực tế.

---

## 1. Cấu trúc Thư mục Chính

### 📂 Backend (Flask)
Nơi xử lý logic nghiệp vụ và API.
- `app.py`: Điểm khởi đầu của ứng dụng, cấu hình Flask và các Blueprint.
- `models.py`: Định nghĩa cấu trúc Database (Bảng Product, Review) dùng SQLAlchemy.
- `sentiment_service.py`: Chứa class `SentimentAI`, nạp mô hình PhoBERT để dự đoán cảm xúc.
- `services/`:
    - `crawler_service.py`: Sử dụng **Playwright** để tự động hóa trình duyệt và cào đánh giá từ Shopee.
- `routes/`: Chia nhỏ các API theo chức năng (chat, analyze, dashboard, reviews).
- `instance/reviews.db`: Cơ sở dữ liệu SQLite lưu trữ thông tin sản phẩm và đánh giá.

### 📂 Frontend (React + Vite + TailwindCSS)
Giao diện người dùng hiện đại và trực quan.
- `src/pages/`: Các trang chính như Dashboard (Tổng quan), Analyze (Trình cào dữ liệu), Chat (Hỏi đáp AI).
- `src/services/api.ts`: Nơi cấu hình gọi các hàm API từ Backend.
- `src/components/`: Các thành phần giao diện dùng chung (biểu đồ, bảng, form).

### 📂 NLP Training (PhoBERT)
Phần nghiên cứu và huấn luyện mô hình.
- `models/phobert_best/`: Chứa các trọng số đã được huấn luyện (Fine-tuned) từ mô hình PhoBERT của VinAI.
- `preprocess.py`: Xử lý tiền dữ liệu văn bản (tách từ bằng PyVi, xóa ký tự đặc biệt).

---

## 2. Luồng Hoạt động của Hệ thống

### Bước 1: Thu thập dữ liệu (Crawling)
1. Người dùng dán URL sản phẩm Shopee vào trang **Analyze** ở Frontend.
2. Frontend gửi URL về Backend API `/api/analyze`.
3. `CrawlerService` khởi tạo một trình duyệt ngầm (headless browser) bằng Playwright, truy cập URL và lấy danh sách các đánh giá (nội dung, tên khách hàng, số sao).

### Bước 2: Phân tích cảm xúc (Sentiment Analysis)
1. Sau khi cào được nội dung, mỗi đánh giá sẽ được đưa qua `SentimentService`.
2. Văn bản được tách từ bằng **PyVi** (ví dụ: "Sản phẩm rất tốt" -> "Sản phẩm rất tốt").
3. Mô hình **PhoBERT** phân tích văn bản và trả về kết quả: `Positive` (Tích cực), `Neutral` (Trung tính), hoặc `Negative` (Tiêu cực) cùng với độ tin cậy (confidence).
4. Dữ liệu cuối cùng được lưu vào file `reviews.db`.

### Bước 3: Hiển thị Tổng quan (Dashboard)
1. Trang **Dashboard** gọi API `/api/dashboard` để lấy các số liệu thống kê (Tổng số đánh giá, tỷ lệ % cảm xúc).
2. Dữ liệu được minh họa bằng các biểu đồ tròn và biểu đồ cột (Recharts) giúp người dùng có cái nhìn nhanh về sản phẩm.

### Bước 4: Hỏi đáp thông minh (AI Chatbot)
1. Người dùng đặt câu hỏi tại trang **AI Insights** (ví dụ: "Khách hàng chê điều gì nhất về sản phẩm này?").
2. Backend nhận câu hỏi, truy vấn các đánh giá thực tế từ Database.
3. Backend tạo một "ngữ cảnh" (Context) chứa các đánh giá này và gửi tới **Ollama (Model Qwen2.5:3b)**.
4. AI đọc dữ liệu và trả lời người dùng dựa trên sự thật (không trả lời linh tinh), kèm theo các nguồn trích dẫn từ đánh giá của khách.

---

## 3. Công nghệ Sử dụng
- **Ngôn ngữ:** Python (Backend), TypeScript (Frontend).
- **Thư viện AI/NLP:** PyTorch, Transformers (HuggingFace), PhoBERT, PyVi.
- **Web Scraping:** Playwright.
- **LLM:** Ollama (Qwen2.5).
- **Database:** SQLite.
- **Frontend Framework:** React, Vite, TailwindCSS, Lucide Icons, Recharts.

---
*Tài liệu này được tạo tự động bởi trợ lý AI để hỗ trợ việc quản lý dự án.*
