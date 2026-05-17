# 📊 Hệ Thống Phân Tích Cảm Xúc Đánh Giá Sản Phẩm

## 🎯 Tổng Quan Dự Án

Đây là hệ thống phân tích cảm xúc (sentiment analysis) cho các đánh giá sản phẩm trên các sàn thương mại điện tử Việt Nam (Shopee, Lazada, Tiki). Hệ thống sử dụng AI để tự động phân loại đánh giá thành 3 loại: **Tích cực**, **Trung lập**, **Tiêu cực**.

### Công Nghệ Sử Dụng

- **Backend**: Flask (Python) + SQLite
- **Frontend**: React + TypeScript + Tailwind CSS
- **AI Model**: PhoBERT (Vietnamese BERT) - Accuracy 88.45%
- **AI Chat**: Claude Sonnet 4.5 via 9Router (Free tier)

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  - Dashboard: Tổng quan thống kê                            │
│  - Analyze: Phân tích sản phẩm mới                          │
│  - Reviews: Danh sách đánh giá                              │
│  - Model Demo: Test mô hình AI                              │
│  - AI Insights: Chat với AI về dữ liệu                      │
│  - Settings: Cấu hình hệ thống                              │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP API
┌──────────────────▼──────────────────────────────────────────┐
│                    BACKEND (Flask)                           │
│  - /api/analyze: Phân tích sản phẩm                         │
│  - /api/reviews: Quản lý đánh giá                           │
│  - /api/dashboard: Thống kê tổng quan                       │
│  - /api/chat: AI chatbot                                    │
│  - /api/predict: Dự đoán sentiment                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼─────────┐
│  SQLite DB     │   │  PhoBERT Model   │
│  - products    │   │  - Sentiment     │
│  - reviews     │   │    Classification│
│  - analysis    │   │  - 88.45% Acc    │
└────────────────┘   └──────────────────┘
```

---

## 📁 Cấu Trúc Thư Mục

```
CĐ1/
├── backend/                    # Flask API Server
│   ├── app.py                 # Main Flask app
│   ├── routes/
│   │   ├── analyze.py         # API phân tích sản phẩm
│   │   ├── reviews.py         # API quản lý reviews
│   │   ├── dashboard.py       # API thống kê
│   │   ├── chat.py            # AI chatbot (9Router)
│   │   └── predict.py         # API dự đoán sentiment
│   ├── models/
│   │   └── sentiment_model.py # Load PhoBERT model
│   └── database.db            # SQLite database
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Trang tổng quan
│   │   │   ├── AnalyzeProduct.tsx # Phân tích sản phẩm
│   │   │   ├── Reviews.tsx        # Danh sách đánh giá
│   │   │   ├── ModelDemo.tsx      # Demo mô hình
│   │   │   ├── AIInsights.tsx     # AI Chat
│   │   │   └── Settings.tsx       # Cài đặt
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Menu điều hướng
│   │   │   ├── Header.tsx         # Header
│   │   │   └── StatCard.tsx       # Card thống kê
│   │   └── services/
│   │       └── api.ts             # API client
│   └── package.json
│
├── nlp_training/              # Training code
│   ├── ml/                    # Machine Learning models
│   │   └── train_svm.py       # TF-IDF + SVM
│   ├── dl/                    # Deep Learning models
│   │   └── train_lstm.py      # LSTM/BiLSTM
│   └── reports/               # Training results
│
└── visualization_results.ipynb # Jupyter notebook gen biểu đồ
```

---

## 🔄 Luồng Hoạt Động Chính

### 1️⃣ Phân Tích Sản Phẩm Mới

```
User nhập URL sản phẩm
    ↓
Frontend gửi POST /api/analyze
    ↓
Backend crawl dữ liệu từ Shopee/Lazada
    ↓
Lấy danh sách reviews
    ↓
PhoBERT phân loại từng review (Tích cực/Trung lập/Tiêu cực)
    ↓
Lưu vào database
    ↓
Trả về kết quả thống kê
    ↓
Frontend hiển thị biểu đồ + insights
```

**Code liên quan:**
- `frontend/src/pages/AnalyzeProduct.tsx` - UI nhập URL
- `backend/routes/analyze.py` - API xử lý
- `backend/models/sentiment_model.py` - PhoBERT inference

---

### 2️⃣ Xem Dashboard Thống Kê

```
User vào trang Dashboard
    ↓
Frontend gọi GET /api/dashboard
    ↓
Backend query database:
  - Tổng số reviews
  - Phân bố sentiment (%)
  - Top issues (vấn đề phổ biến)
  - Sentiment score trung bình
    ↓
Trả về JSON data
    ↓
Frontend render biểu đồ (Chart.js)
```

**Code liên quan:**
- `frontend/src/pages/Dashboard.tsx` - UI dashboard
- `backend/routes/dashboard.py` - API thống kê

---

### 3️⃣ Chat với AI về Dữ Liệu

```
User hỏi: "Khách hàng chê gì?"
    ↓
Frontend gửi POST /api/chat
    ↓
Backend:
  1. Lấy context từ database (reviews tiêu cực)
  2. Gửi request đến 9Router (Claude Sonnet 4.5)
  3. AI phân tích và trả lời
    ↓
Trả về câu trả lời + sources
    ↓
Frontend hiển thị chat bubble
```

**Code liên quan:**
- `frontend/src/pages/AIInsights.tsx` - UI chat
- `backend/routes/chat.py` - API chat (9Router integration)

---

### 4️⃣ Demo Mô Hình (Test Nhanh)

```
User nhập text: "Sản phẩm rất tốt"
    ↓
Frontend gửi POST /api/predict
    ↓
Backend:
  1. Tokenize text (PhoBERT tokenizer)
  2. Model inference
  3. Trả về label + confidence
    ↓
Frontend hiển thị kết quả
```

**Code liên quan:**
- `frontend/src/pages/ModelDemo.tsx` - UI demo
- `backend/routes/predict.py` - API dự đoán

---

## 🤖 Mô Hình AI

### PhoBERT (Mô Hình Chính)

- **Kiến trúc**: BERT pre-trained cho tiếng Việt
- **Task**: Sentiment Classification (3 classes)
- **Performance**:
  - Accuracy: 88.45%
  - Precision: 87.92%
  - Recall: 87.95%
  - F1-Score: 88.23%
- **Training**: 8 epochs, 95 phút
- **Inference**: 9ms/sample (real-time)

### So Sánh với Baseline

| Model | Accuracy | F1-Score | Train Time | Inference |
|-------|----------|----------|------------|-----------|
| TF-IDF + SVM | 80.00% | 78.00% | 0.05 min | 1.5ms |
| LSTM/BiLSTM | 82.00% | 81.00% | 4 min | 7.5ms |
| **PhoBERT** | **88.45%** | **88.23%** | 95 min | 9ms |

**Kết luận**: PhoBERT tốt hơn 8.45% so với baseline, inference time vẫn chấp nhận được.

---

## 🗄️ Database Schema

### Table: `products`
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    url TEXT,
    name TEXT,
    platform TEXT,  -- 'shopee', 'lazada', 'tiki'
    created_at TIMESTAMP
);
```

### Table: `reviews`
```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    content TEXT,
    rating INTEGER,  -- 1-5 stars
    sentiment TEXT,  -- 'positive', 'neutral', 'negative'
    confidence REAL, -- 0.0-1.0
    created_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Table: `analysis_history`
```sql
CREATE TABLE analysis_history (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    total_reviews INTEGER,
    positive_count INTEGER,
    neutral_count INTEGER,
    negative_count INTEGER,
    sentiment_score REAL,  -- 0-100
    analyzed_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 🚀 Cách Chạy Dự Án

### 1. Setup Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# Server chạy tại http://localhost:5000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
# App chạy tại http://localhost:5173
```

### 3. Setup 9Router (AI Chat)

- Download 9Router từ https://github.com/decolua/9router
- Chạy 9Router trên port 20128
- Model: `kr/claude-sonnet-4.5` (Free tier)

---

## 🔧 API Endpoints

### Analyze
```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://shopee.vn/product/123456"
}

Response:
{
  "product_id": 1,
  "total_reviews": 150,
  "sentiment_distribution": {
    "positive": 60,
    "neutral": 30,
    "negative": 10
  },
  "sentiment_score": 75.5,
  "top_issues": ["Giao hàng chậm", "Đóng gói kém"]
}
```

### Dashboard
```http
GET /api/dashboard

Response:
{
  "summary": {
    "total": 1500,
    "positive": 900,
    "neutral": 400,
    "negative": 200,
    "sentiment_score": 73.3
  },
  "top_issues": [
    {"issue": "Giao hàng chậm", "count": 45},
    {"issue": "Đóng gói kém", "count": 32}
  ]
}
```

### Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Khách hàng chê gì?",
  "history": []
}

Response:
{
  "answer": "Khách hàng chủ yếu phản ánh về...",
  "sources": [
    {"id": 1, "content": "Giao hàng chậm quá", "sentiment": "negative"}
  ]
}
```

### Predict
```http
POST /api/predict
Content-Type: application/json

{
  "text": "Sản phẩm rất tốt, đóng gói cẩn thận"
}

Response:
{
  "sentiment": "positive",
  "confidence": 0.95,
  "probabilities": {
    "positive": 0.95,
    "neutral": 0.03,
    "negative": 0.02
  }
}
```

---

## 📊 Biểu Đồ Kết Quả

Các biểu đồ được gen từ `visualization_results.ipynb`:

1. **3.6.2_model_comparison.png** - So sánh hiệu suất 3 mô hình
2. **3.6.3_radar_chart.png** - Biểu đồ radar đa chiều
3. **3.6.4_time_comparison.png** - So sánh thời gian xử lý
4. **3.6.5_training_progress.png** - Quá trình training PhoBERT
5. **3.6.6_confusion_matrix.png** - Ma trận nhầm lẫn

---

## 🎨 Frontend Components

### Dashboard
- **StatCard**: Hiển thị metrics (Total, Positive, Negative, Score)
- **PieChart**: Phân bố sentiment
- **BarChart**: Top issues
- **LineChart**: Sentiment trend theo thời gian

### AnalyzeProduct
- **URLInput**: Nhập URL sản phẩm
- **LoadingSpinner**: Hiển thị khi đang crawl
- **ResultCard**: Kết quả phân tích
- **ReviewList**: Danh sách reviews đã phân loại

### AIInsights
- **ChatBubble**: Tin nhắn user/bot
- **SuggestedQuestions**: Gợi ý câu hỏi
- **SourceCard**: Hiển thị nguồn trích dẫn

---

## 🔐 Bảo Mật & Best Practices

1. **API Rate Limiting**: Giới hạn số request/phút
2. **Input Validation**: Validate URL, text input
3. **SQL Injection Prevention**: Sử dụng parameterized queries
4. **CORS**: Chỉ cho phép frontend domain
5. **Error Handling**: Try-catch toàn bộ API endpoints

---

## 🐛 Troubleshooting

### Backend không chạy được
```bash
# Check Python version (cần >= 3.8)
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend không kết nối được API
```typescript
// Kiểm tra API_BASE_URL trong src/services/api.ts
const API_BASE_URL = 'http://localhost:5000/api';
```

### AI Chat không hoạt động
```bash
# Kiểm tra 9Router đang chạy
curl http://localhost:20128/v1/models

# Nếu không có, start 9Router
./9router
```

### Model inference chậm
- Kiểm tra GPU có được sử dụng không
- Giảm batch size
- Sử dụng quantized model

---

## 📈 Roadmap

- [ ] Thêm hỗ trợ TikTok Shop
- [ ] Export báo cáo PDF
- [ ] Real-time monitoring dashboard
- [ ] Multi-language support (English)
- [ ] Mobile app (React Native)
- [ ] Aspect-based sentiment analysis

---

## 👥 Contributors

- **Lê Thị Kim Ngân** - Developer & Researcher
- **Thầy Kiên** - Advisor

---

## 📝 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

---

## 📞 Contact

- Email: lengan@example.com
- GitHub: [Project Repository]

---

**Last Updated**: 2026-05-17
